import { Injectable } from '@angular/core';
import { GoogleApiQuery } from '../shared/google-api/google-api.query';
import { combineLatest, Observable } from 'rxjs';
import { Calendar, CalendarEvent } from '../shared/google-api/types/calendar.model';
import { map, switchMap } from 'rxjs/operators';
import { AppQuery } from '../../state/app.query';
import { CalendarApiService } from '../shared/google-api';

@Injectable({
	providedIn: 'root',
})
export class CalendarService {
	constructor(
		private googleApiQuery: GoogleApiQuery,
		private appQuery: AppQuery,
		private calendarApiService: CalendarApiService
	) {}

	readonly eventsWithCalendars$: Observable<Array<CalendarEvent & { calendar: Calendar }>> =
		combineLatest([
			this.googleApiQuery.select('calendarEvents'),
			this.appQuery.userCalendars$,
		]).pipe(
			map(
				([events, calendars]) =>
					events
						.map((event) => ({
							...event,
							calendar: calendars.find((c) => c.id === event.organizer.email),
						}))
						.filter(({ calendar }) => !!calendar) as Array<
						CalendarEvent & { calendar: Calendar }
					>
			)
		);

	fetchEventsForSelectedCalendars() {
		return this.appQuery.userCalendars$.pipe(
			switchMap((calendars) =>
				this.calendarApiService.fetchEvents(calendars.map((c) => c.id))
			)
		);
	}
}
