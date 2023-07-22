import { ChangeDetectionStrategy, Component, TrackByFunction } from '@angular/core';
import { MealQuery } from './meal/state/meal.query';
import { combineLatest, Observable, timer } from 'rxjs';
import { Meal } from './meal/state/meal.model';
import { DragDropService } from './meal/drag-drop.service';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { NgxVibrationService } from 'ngx-vibration';
import { AppService } from '../../state/app.service';
import { AppQuery } from '../../state/app.query';
import { generateSchedule, Period } from '../model/period';
import { addDays, isBefore, isSameDay, isSameMonth, startOfDay } from 'date-fns/esm';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CroquettesService } from '../croquettes.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
	selector: 'cb-planning',
	templateUrl: './planning.component.html',
	styleUrls: ['./planning.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent {
	meals$: Observable<Meal[]> = combineLatest([
		this.appQuery.select('schedule'),
		this.appQuery.userConfig$,
	]).pipe(
		switchMap(([schedule, userConfig]) => {
			const startWeekOn = userConfig?.startWeekOn;
			const res = { ...schedule };
			if (startWeekOn && startWeekOn > 0) {
				const today = startOfDay(Date.now());
				const shiftBy = isBefore(today, addDays(new Date(res.from), startWeekOn))
					? startWeekOn - 7
					: startWeekOn;
				// The user wants the week to start another day than monday
				res.from = addDays(new Date(res.from), shiftBy);
				res.to = addDays(new Date(res.to), shiftBy);
			}
			return this.mealQuery.getMealDays(res);
		}),
		debounceTime(200)
	);
	showDragCancelButton$ = this.dragDropService.dragging$.pipe(
		map((dragging) => !!dragging),
		startWith(false)
	);
	currentSchedule$: Observable<Period> = this.appQuery.select('schedule');
	isThisWeek$: Observable<boolean> = this.currentSchedule$.pipe(
		map((schedule) => isSameDay(schedule.from, generateSchedule().from))
	);
	scheduleOverlapsTwoMonths$: Observable<boolean> = this.currentSchedule$.pipe(
		map((schedule) => !isSameMonth(schedule.from, schedule.to))
	);

	readonly showMoumouEscapeHint$: Observable<boolean> = timer(0, 60000).pipe(
		map(() => {
			const moumouEscapeDay = new Date(2023, 7, 19);
			return isSameDay(Date.now(), moumouEscapeDay);
		})
	);

	trackByFn: TrackByFunction<Meal> = (index, item) => item.id;

	get isXSmall() {
		return this.breakpointObserver.isMatched(Breakpoints.XSmall);
	}

	constructor(
		private mealQuery: MealQuery,
		private dragDropService: DragDropService,
		private vibrationService: NgxVibrationService,
		private appQuery: AppQuery,
		private appService: AppService,
		private breakpointObserver: BreakpointObserver,
		private croquettesService: CroquettesService,
		private hotToastService: HotToastService
	) {
		this.croquettesService.prompt$.subscribe(() => {
			const croquettesToastRef = this.hotToastService.show(
				'<strong>Jour de croquettes !</strong>',
				{
					icon: '🐱',
					autoClose: false,
					dismissible: true,
					position: 'bottom-center',
					closeStyle: {
						'margin-top': '5px',
						cursor: 'pointer',
					},
				}
			);
			croquettesToastRef.afterClosed.subscribe(() => {
				this.vibrationService.vibrate([75]);
				this.croquettesService.markAsDisplayed();
			});
		});
	}

	onDrop() {
		this.vibrationService.vibrate([150]);
	}

	shiftSchedule(direction: 'previous' | 'next') {
		this.appService.shiftSchedule(direction);
	}

	/**
	 * On mobile, scroll to the top of the saved meal element
	 * @param mealElement
	 */
	scrollToMeal(mealElement: HTMLDivElement) {
		if (this.isXSmall) {
			mealElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	onCurrentPeriodClicked() {
		this.appService.resetSchedule();
	}

	getMealAnimation() {
		if (this.isXSmall) {
			return '';
			return 'swing-in-top-fwd';
		}
		return 'slide-in-blurred-bottom';
	}

	getMealAnimationDelay(index: number) {
		if (this.isXSmall) {
			return index * 50 + 'ms';
		}
		return Math.pow(1.25, index) * 50 + 'ms';
	}
}
