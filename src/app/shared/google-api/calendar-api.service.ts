import { Injectable } from '@angular/core';
import { Calendar, CalendarEvent, CalendarEventsData } from './types/calendar.model';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Serialized } from '../../../../functions/src/helpers/serialized';
import { Observable, of } from 'rxjs';
import { GoogleApiService } from './google-api.service';
import { GoogleApiStore } from './google-api.store';
import { environment } from '../../../environments/environment';
import { mockCalendars } from './mock-data/calendars.json';
import { mockEvents } from './mock-data/events';

declare const gapi: any;

@Injectable({
	providedIn: 'root',
})
export class CalendarApiService {
	constructor(
		private googleApiService: GoogleApiService,
		private googleApiStore: GoogleApiStore
	) {}

	private readonly calendarApiLoaded$ = this.googleApiService.waitForGapi$.pipe(
		switchMap(() => {
			return new Observable((observer) => {
				gapi.client.load('calendar', 'v3', () => {
					observer.next();
					observer.complete();
				});
			});
		}),
		shareReplay({ refCount: true, bufferSize: 1 })
	);

	fetchCalendars(): Observable<Calendar[]> {
		const prodData$: Observable<Calendar[]> = this.calendarApiLoaded$.pipe(
			switchMap(() => {
				return new Observable<Calendar[]>((observer) => {
					gapi.client.calendar.calendarList
						.list()
						.execute((data: { items: Calendar[] }) => {
							observer.next(data.items);
							observer.complete();
						});
				});
			})
		);
		const mockData$: Observable<Calendar[]> = of(mockCalendars);
		const source$ = environment.production ? prodData$ : mockData$;
		return source$.pipe(tap((calendars) => this.googleApiStore.update({ calendars })));
	}

	fetchEvents(): Observable<CalendarEventsData> {
		const prodData$: Observable<Serialized<CalendarEventsData>> = this.calendarApiLoaded$.pipe(
			switchMap(
				() =>
					gapi.client.calendar.events.list({
						calendarId: 'qv801uclagrrru0lqv46mdvrr8@group.calendar.google.com',
						timeMin: new Date().toISOString(),
						showDeleted: false,
						singleEvents: true,
						maxResults: 10,
						orderBy: 'startTime',
					}) as Promise<any>
			),
			map(({ result }: any) => result as Serialized<CalendarEventsData>)
		);
		const mockData$: Observable<Serialized<CalendarEventsData>> = of(mockEvents).pipe(
			map(
				(items): Serialized<CalendarEventsData> => ({
					items,
					kind: 'calendar#events',
					accessRole: '',
					defaultReminders: [],
					updated: `${new Date()}`,
					nextPageToken: '',
					summary: '',
					timeZone: '',
				})
			)
		);
		const source$ = environment.production ? prodData$ : mockData$;
		return source$.pipe(
			map(
				(data): CalendarEventsData => ({
					...data,
					updated: new Date(data.updated),
					items: data.items.map(
						(event): CalendarEvent => ({
							...event,
							created: GoogleApiService.toDate(event.created),
							updated: GoogleApiService.toDate(event.updated),
							start: {
								...event.start,
								date: GoogleApiService.toDate(event.start.date),
								dateTime: GoogleApiService.toDate(event.start.dateTime),
							},
							end: {
								...event.end,
								date: GoogleApiService.toDate(event.end.date),
								dateTime: GoogleApiService.toDate(event.end.dateTime),
							},
							originalStartTime: event.originalStartTime
								? {
										...event.originalStartTime,
										date: GoogleApiService.toDate(
											event.originalStartTime?.date
										),
										dateTime: GoogleApiService.toDate(
											event.originalStartTime.dateTime
										),
								  }
								: undefined,
						})
					),
				})
			),
			tap((data) => {
				const { items: calendarEvents, ...calendarEventsData } = data;
				this.googleApiStore.update({ calendarEvents, calendarEventsData });
			})
		);
	}
}
