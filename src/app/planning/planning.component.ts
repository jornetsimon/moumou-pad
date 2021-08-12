import { ChangeDetectionStrategy, Component, TrackByFunction } from '@angular/core';
import { MealQuery } from './meal/state/meal.query';
import { Observable } from 'rxjs';
import { Meal } from './meal/state/meal.model';
import { DragDropService } from './meal/drag-drop.service';
import { map, startWith, switchMap } from 'rxjs/operators';
import { NgxVibrationService } from 'ngx-vibration';
import { AppService } from '../../state/app.service';
import { AppQuery } from '../../state/app.query';
import { generateSchedule, Period } from '../model/period';
import { isSameDay, isSameMonth } from 'date-fns/esm';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
	selector: 'cb-planning',
	templateUrl: './planning.component.html',
	styleUrls: ['./planning.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent {
	meals$: Observable<Meal[]> = this.appQuery
		.select('schedule')
		.pipe(switchMap((schedule) => this.mealQuery.getMealDays(schedule)));
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

	trackByFn: TrackByFunction<Meal> = (index, item) => item.date.getTime();

	constructor(
		private mealQuery: MealQuery,
		private dragDropService: DragDropService,
		private vibrationService: NgxVibrationService,
		private appQuery: AppQuery,
		private appService: AppService,
		private breakpointObserver: BreakpointObserver
	) {}

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
		if (this.breakpointObserver.isMatched(Breakpoints.XSmall)) {
			mealElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
}
