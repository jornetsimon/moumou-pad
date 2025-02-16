import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TuiButtonModule, TuiIconModule } from '@taiga-ui/experimental';
import { TuiHintModule } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isSameDay, isSameMonth, isSameWeek, nextMonday } from 'date-fns/esm';
import { generateSchedule, Period } from '../../model/period';
import { AppQuery } from '../../../state/app.query';
import { AppService } from '../../../state/app.service';
import { TuiRippleModule } from '@taiga-ui/addon-mobile';

@Component({
    selector: 'cb-week-navigation',
    imports: [
    CommonModule,
    MatIconModule,
    TuiIconModule,
    TuiButtonModule,
    TuiHintModule,
    TuiRippleModule
],
    templateUrl: './week-navigation.component.html',
    styleUrl: './week-navigation.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekNavigationComponent {
	constructor(
		private readonly appQuery: AppQuery,
		private readonly appService: AppService,
		private readonly router: Router
	) {}

	private readonly datePipe = new DatePipe('fr-FR');

	readonly currentSchedule$: Observable<Period> = this.appQuery.select('schedule');

	readonly weekLabel$ = this.currentSchedule$.pipe(
		map(({ from, to }) => {
			const isThisWeek = isSameDay(from, generateSchedule().from);
			if (isThisWeek) {
				return `Cette semaine`;
			}

			const isNextWeek = isSameWeek(from, nextMonday(Date.now()), { weekStartsOn: 1 });
			if (isNextWeek) {
				return `Semaine prochaine`;
			}

			const scheduleOverlapsTwoMonths = !isSameMonth(from, to);

			const fromLabel = this.datePipe.transform(
				from,
				scheduleOverlapsTwoMonths ? 'd MMMM' : 'd'
			);
			const toLabel = this.datePipe.transform(to, 'd MMMM');

			return `<span class="whitespace-nowrap">du ${fromLabel}</span> au <span class="whitespace-nowrap">${toLabel}</span>`;
		})
	);

	shiftSchedule(direction: 'previous' | 'next') {
		this.appService.shiftSchedule(direction);
		window.scrollTo({
			behavior: 'instant',
			top: 0,
		});
	}

	onCurrentPeriodClicked() {
		this.appService.resetSchedule();
		this.router.navigateByUrl('/');
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	}
}
