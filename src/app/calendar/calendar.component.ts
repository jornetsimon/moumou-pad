import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalendarApiService } from '../shared/google-api';
import { GoogleApiQuery } from '../shared/google-api/google-api.query';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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
		private googleApiQuery: GoogleApiQuery
	) {
		this.calendarApiService.fetchCalendars().pipe(untilDestroyed(this)).subscribe();
		this.calendarApiService.fetchEvents().pipe(untilDestroyed(this)).subscribe();
	}

	readonly calendars$ = this.googleApiQuery.select('calendars');
	readonly events$ = this.googleApiQuery.eventsWithCalendars$;
}
