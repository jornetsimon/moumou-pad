import { Injectable } from '@angular/core';
import { Calendar, CalendarEvent, CalendarEventsData } from './types/calendar.model';
import { map, tap } from 'rxjs/operators';
import { Serialized } from '../../../../functions/src/helpers/serialized';
import { combineLatest, Observable, of } from 'rxjs';
import { GoogleApiService } from './google-api.service';
import { GoogleApiStore } from './google-api.store';
import { environment } from '../../../environments/environment';
import { mockCalendars } from './mock-data/calendars.json';
import { mockEvents } from './mock-data/events';
import { flattenDepth } from 'lodash-es';
import { addDays } from 'date-fns';
import { TinyColor } from '@ctrl/tinycolor';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class CalendarApiService {
	constructor(
		private googleApiService: GoogleApiService,
		private googleApiStore: GoogleApiStore,
		private http: HttpClient
	) {}

	fetchCalendars(): Observable<Calendar[]> {
		const prodData$: Observable<Calendar[]> = this.http
			.get<{ items: Calendar[] }>(
				'https://www.googleapis.com/calendar/v3/users/me/calendarList'
			)
			.pipe(map(({ items }) => items));
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
		const prodData$: Observable<Array<Serialized<CalendarEventsData>>> = combineLatest(
			calendarIds
				.filter((c) => !c.includes('#'))
				.map((calendarId) => {
					return this.http.get<Serialized<CalendarEventsData>>(
						encodeURI(
							`https://www.googleapis.com/calendar/v3/calendars/${calendarId.replace(
								'#',
								'%23'
							)}/events`
						),
						{
							params: {
								timeMin: new Date().toISOString(),
								timeMax: addDays(new Date(), 7).toISOString(),
								showDeleted: false,
								singleEvents: true,
								maxResults: 10,
								orderBy: 'startTime',
							},
						}
					);
				})
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
