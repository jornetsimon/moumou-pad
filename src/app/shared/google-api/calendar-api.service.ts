import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Calendar, CalendarEvent, CalendarEventsData } from './types/calendar.model';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Serialized } from '../../../../functions/src/helpers/serialized';
import { Observable } from 'rxjs';
import { GoogleApiService } from './google-api.service';

declare const gapi: any;

@Injectable({
	providedIn: 'root',
})
export class CalendarApiService {
	constructor(private http: HttpClient, private googleApiService: GoogleApiService) {}

	readonly calendarApiLoaded$ = this.googleApiService.waitForGapi$.pipe(
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

	fetchCalendarList(): Observable<Calendar[]> {
		return this.calendarApiLoaded$.pipe(
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
	}

	fetchEvents(): Observable<CalendarEventsData> {
		return this.calendarApiLoaded$.pipe(
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
			tap((_) => console.log(_)),
			map(({ result }: any): Serialized<CalendarEventsData> => result),
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
			)
		);
	}
}
