import { Injectable } from '@angular/core';
import { Calendar, CalendarEvent, CalendarEventsData } from './types/calendar.model';
import { first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Serialized } from '../../../../functions/src/helpers/serialized';
import { combineLatest, from, Observable, of } from 'rxjs';
import { GoogleApiService } from './google-api.service';
import { GoogleApiStore } from './google-api.store';
import { environment } from '../../../environments/environment';
import { mockCalendars } from './mock-data/calendars.json';
import { mockEvents } from './mock-data/events';
import { flattenDepth } from 'lodash-es';
import { addDays } from 'date-fns';
import { TinyColor } from '@ctrl/tinycolor';

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
		const source$ =
			!environment.production && environment.useMockGoogleApiData ? mockData$ : prodData$;
		return source$.pipe(
			map((calendars) => calendars.map(CalendarApiService.unserializeCalendar)),
			tap((calendars) => this.googleApiStore.update({ calendars }))
		);
	}

	fetchEvents(calendarIds: string[]): Observable<CalendarEventsData[]> {
		if (!calendarIds.length) {
			return of([]);
		}
		const prodData$: Observable<Array<Serialized<CalendarEventsData>>> =
			this.calendarApiLoaded$.pipe(
				switchMap(() =>
					combineLatest(
						calendarIds.map((calendarId) =>
							from(
								gapi.client.calendar.events.list({
									calendarId,
									timeMin: new Date().toISOString(),
									timeMax: addDays(new Date(), 7).toISOString(),
									showDeleted: false,
									singleEvents: true,
									maxResults: 10,
									orderBy: 'startTime',
								}) as Promise<any>
							).pipe(
								map(({ result }: any) => result as Serialized<CalendarEventsData>)
							)
						)
					)
				),
				first()
			);
		const mockData$: Observable<Array<Serialized<CalendarEventsData>>> = of(mockEvents).pipe(
			map(
				(items): Array<Serialized<CalendarEventsData>> => [
					{
						items,
						kind: 'calendar#events',
						accessRole: '',
						defaultReminders: [],
						updated: `${new Date()}`,
						nextPageToken: '',
						summary: '',
						timeZone: '',
					},
				]
			)
		);
		const source$ =
			!environment.production && environment.useMockGoogleApiData ? mockData$ : prodData$;
		return source$.pipe(
			map((eventsByCalendar) => flattenDepth(eventsByCalendar, 1)),
			map((items: Array<Serialized<CalendarEventsData>>) =>
				items.map(CalendarApiService.unserializeCalendarEventData)
			),
			tap((data) => {
				const allEvents = flattenDepth(
					data.map((d) => d.items),
					1
				);
				this.googleApiStore.update({ calendarEvents: allEvents });
			})
		);
	}

	private static unserializeCalendarEvent(event: Serialized<CalendarEvent>): CalendarEvent {
		return {
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
						date: GoogleApiService.toDate(event.originalStartTime?.date),
						dateTime: GoogleApiService.toDate(event.originalStartTime.dateTime),
				  }
				: undefined,
		};
	}

	private static unserializeCalendarEventData(
		data: Serialized<CalendarEventsData>
	): CalendarEventsData {
		return {
			...data,
			updated: new Date(data.updated),
			items: data.items.map(CalendarApiService.unserializeCalendarEvent),
		};
	}

	private static unserializeCalendar(calendar: Serialized<Calendar>): Calendar {
		const backgroundColor = new TinyColor(calendar.backgroundColor);
		const foregroundColor = backgroundColor.getLuminance() > 0.33 ? '#000000' : '#ffffff';
		return { ...calendar, foregroundColor };
	}
}
