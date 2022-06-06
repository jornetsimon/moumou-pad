import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalendarApiService } from '../shared/google-api';
import { map, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { Calendar, CalendarEvent } from '../shared/google-api/types/calendar.model';

@Component({
	selector: 'cb-calendar',
	templateUrl: './calendar.component.html',
	styleUrls: ['./calendar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
	constructor(private calendarApiService: CalendarApiService) {}

	readonly calendars: Observable<Calendar[]> = this.calendarApiService.fetchCalendarList();

	readonly events$ = combineLatest([this.calendarApiService.fetchEvents(), this.calendars]).pipe(
		map(
			([{ items }, calendars]) =>
				items
					.map((event) => ({
						...event,
						calendar: calendars.find((c) => c.id === event.organizer.email),
					}))
					.filter(({ calendar }) => !!calendar) as Array<
					CalendarEvent & { calendar: Calendar }
				>
		),
		tap((events) => console.log({ events }))
	);
}
