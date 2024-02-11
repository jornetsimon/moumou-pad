import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { TuiButtonModule, TuiIconModule } from '@taiga-ui/experimental';
import { TuiHintModule } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isSameDay, isSameMonth } from 'date-fns/esm';
import { generateSchedule, Period } from '../../model/period';
import { AppQuery } from '../../../state/app.query';
import { AppService } from '../../../state/app.service';

@Component({
	selector: 'cb-week-navigation',
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		RouterLink,
		TuiIconModule,
		TuiButtonModule,
		TuiHintModule,
	],
	templateUrl: './week-navigation.component.html',
	styleUrl: './week-navigation.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekNavigationComponent {
	constructor(
		private readonly appQuery: AppQuery,
		private readonly appService: AppService,
		private readonly router: Router
	) {}

	private readonly datePipe = new DatePipe('fr-FR');

	readonly currentSchedule$: Observable<Period> = this.appQuery.select('schedule');

	readonly isThisWeek$: Observable<boolean> = this.currentSchedule$.pipe(
		map((schedule) => isSameDay(schedule.from, generateSchedule().from))
	);

	readonly scheduleOverlapsTwoMonths$: Observable<boolean> = this.currentSchedule$.pipe(
		map((schedule) => !isSameMonth(schedule.from, schedule.to))
	);

	readonly weekLabel$ = this.currentSchedule$.pipe(
		map(({ from, to }) => {
			const isThisWeek = isSameDay(from, generateSchedule().from);

			if (isThisWeek) {
				return `Cette semaine`;
			}

			const scheduleOverlapsTwoMonths = !isSameMonth(from, to);

			const fromLabel = this.datePipe.transform(
				from,
				scheduleOverlapsTwoMonths ? 'd MMMM' : 'd'
			);
			const toLabel = this.datePipe.transform(to, 'd MMMM');

			return `du ${fromLabel} au ${toLabel}`;
		})
	);

	shiftSchedule(direction: 'previous' | 'next') {
		this.appService.shiftSchedule(direction);
	}

	onCurrentPeriodClicked() {
		this.appService.resetSchedule();
		this.router.navigateByUrl('/');
	}
}
