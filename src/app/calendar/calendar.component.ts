import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalendarApiService } from '../shared/google-api';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs/operators';
import { CalendarService } from './calendar.service';

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
		//this.calendarApiService.fetchCalendars().pipe(untilDestroyed(this)).subscribe();
		this.calendarApiService.fetchEvents().pipe(untilDestroyed(this)).subscribe();
	}

	readonly events$ = this.calendarService.eventsWithCalendars$.pipe(
		tap((_) => console.log({ events: _ }))
	);
}
