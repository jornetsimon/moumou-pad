import { Component } from '@angular/core';
import { GoogleApiQuery } from '../../shared/google-api/google-api.query';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CalendarApiService } from '../../shared/google-api';
import { AppService } from '../../../state/app.service';
import { AppQuery } from '../../../state/app.query';
import { first, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { sortBy } from 'lodash-es';

@UntilDestroy()
@Component({
	selector: 'cb-calendar-selection',
	templateUrl: './calendar-selection.component.html',
	styleUrls: ['./calendar-selection.component.scss'],
})
export class CalendarSelectionComponent {
	constructor(
		private calendarApiService: CalendarApiService,
		private googleApiQuery: GoogleApiQuery,
		private appService: AppService,
		private appQuery: AppQuery
	) {
		this.calendarApiService.fetchCalendars().pipe(untilDestroyed(this)).subscribe();
	}

	readonly availableCalendars$ = this.googleApiQuery
		.select('calendars')
		.pipe(map((calendars) => sortBy(calendars, 'summary')));
	readonly selectedCalendars$ = this.appQuery.userCalendars$;

	readonly calendars$ = combineLatest([this.availableCalendars$, this.selectedCalendars$]).pipe(
		map(([availableCalendars, selectedCalendars]) =>
			availableCalendars.map((ac) => ({
				...ac,
				selected: !!selectedCalendars.find((c) => c.id === ac.id),
			}))
		)
	);

	toggleCalendar(calendarId: string, selected: boolean) {
		this.calendars$
			.pipe(
				first(),
				map((calendars) => {
					const index = calendars.findIndex((c) => c.id === calendarId);
					calendars[index].selected = selected;
					return calendars.filter((c) => c.selected);
				})
			)
			.subscribe({ next: (newValue) => this.appService.setCalendars(newValue) });
	}
}
