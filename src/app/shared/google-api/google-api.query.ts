import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { GoogleApiState, GoogleApiStore } from './google-api.store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Calendar, CalendarEvent } from './types/calendar.model';

@Injectable({ providedIn: 'root' })
export class GoogleApiQuery extends Query<GoogleApiState> {
	constructor(protected store: GoogleApiStore) {
		super(store);
	}

	readonly eventsWithCalendars$: Observable<Array<CalendarEvent & { calendar: Calendar }>> =
		combineLatest([this.select('calendarEvents'), this.select('calendars')]).pipe(
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
