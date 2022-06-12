import { Injectable } from '@angular/core';
import { GoogleApiQuery } from '../shared/google-api/google-api.query';
import { combineLatest, Observable } from 'rxjs';
import { Calendar, CalendarEvent } from '../shared/google-api/types/calendar.model';
import { map } from 'rxjs/operators';
import { AppQuery } from '../../state/app.query';

@Injectable({
	providedIn: 'root',
})
export class CalendarService {
	constructor(private googleApiQuery: GoogleApiQuery, private appQuery: AppQuery) {}

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
}
