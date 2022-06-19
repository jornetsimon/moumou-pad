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

	toggleCalendars(selection: Array<{ calendarId: string; selected: boolean }> | true | false) {
		this.calendars$
			.pipe(
				first(),
				map((calendars) => {
					if (typeof selection === 'boolean') {
						return calendars.map((calendar) => ({ ...calendar, selected: selection }));
					}
					return calendars.map((calendar) => {
						const match = selection.find((s) => s.calendarId === calendar.id);
						return {
							...calendar,
							selected: match !== undefined ? match.selected : calendar.selected,
						};
					});
				}),
				map((calendars) => calendars.filter((c) => c.selected))
			)
			.subscribe({ next: (newValue) => this.appService.setCalendars(newValue) });
	}
}
