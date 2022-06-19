import { ChangeDetectionStrategy, Component, TrackByFunction } from '@angular/core';
import { CalendarApiService } from '../shared/google-api';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CalendarService } from './calendar.service';
import { debugObservable } from '../../../debug-observable';
import { CalendarEvent } from '../shared/google-api/types/calendar.model';

@UntilDestroy()
@Component({
	selector: 'cb-calendar',
	templateUrl: './calendar.component.html',
	styleUrls: ['./calendar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
	constructor(
		private calendarApiService: CalendarApiService,
		private calendarService: CalendarService
	) {
		this.calendarService
			.fetchEventsForSelectedCalendars()
			.pipe(untilDestroyed(this))
			.subscribe();
	}

	readonly trackByEvent: TrackByFunction<CalendarEvent> = (index, event) => event.id;

	readonly events$ = this.calendarService.eventsWithCalendars$.pipe(debugObservable('events'));
}
