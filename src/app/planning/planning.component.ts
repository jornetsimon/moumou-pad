import { ChangeDetectionStrategy, Component, TrackByFunction } from '@angular/core';
import { MealQuery } from './meal/state/meal.query';
import { combineLatest, Observable } from 'rxjs';
import { Meal } from './meal/state/meal.model';
import { DragDropService } from './meal/drag-drop.service';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { AppQuery } from '../../state/app.query';
import { addDays, isBefore, startOfDay } from 'date-fns/esm';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgxVibrationModule, NgxVibrationService } from 'ngx-vibration';
import { MealComponent } from './meal/meal.component';
import { WeekNavigationComponent } from './week-navigation/week-navigation.component';
import { TuiCarouselModule } from '@taiga-ui/kit';
import { TUI_SWIPE_OPTIONS, TuiSwipe, TuiSwipeModule } from '@taiga-ui/cdk';
import { AppService } from '../../state/app.service';
import { Router } from '@angular/router';
import { TuiSwipeOptions } from '@taiga-ui/cdk/interfaces';
import { CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TuiButtonModule } from '@taiga-ui/core';

@Component({
	selector: 'cb-planning',
	templateUrl: './planning.component.html',
	styleUrls: ['./planning.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		MealComponent,
		WeekNavigationComponent,
		TuiCarouselModule,
		TuiSwipeModule,
		CdkDropList,
		MatIconModule,
		NgxVibrationModule,
		TuiButtonModule,
		CdkDropListGroup,
	],
	providers: [
		{
			provide: TUI_SWIPE_OPTIONS,
			useValue: { threshold: 150, timeout: 500 } satisfies TuiSwipeOptions,
		},
	],
})
export class PlanningComponent {
	constructor(
		private readonly mealQuery: MealQuery,
		private readonly dragDropService: DragDropService,
		private readonly vibrationService: NgxVibrationService,
		private readonly appQuery: AppQuery,
		private readonly appService: AppService,
		private readonly breakpointObserver: BreakpointObserver,
		private readonly router: Router
	) {}

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

	readonly showMoumouEscapeHint$: Observable<boolean> = this.appQuery
		.select('userData')
		.pipe(map((userData) => !!userData?.isAllowedInFamily && userData.familyName === 'jornet'));

	trackByFn: TrackByFunction<Meal> = (index, item) => item.id;

	get isXSmall() {
		return this.breakpointObserver.isMatched(Breakpoints.XSmall);
	}

	onDrop() {
		this.vibrationService.vibrate([150]);
	}

	/**
	 * On mobile, scroll to the top of the saved meal element
	 * @param mealElement
	 */
	scrollToMeal(mealElement: HTMLDivElement) {
		if (!this.isXSmall) {
			return;
		}
		const offset = 120;

		window.scrollTo({
			behavior: 'smooth',
			top:
				mealElement.getBoundingClientRect().top -
				document.body.getBoundingClientRect().top -
				offset,
		});
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

	async onSwipe(swipe: TuiSwipe) {
		if (!['right', 'left'].includes(swipe.direction)) {
			return;
		}

		await this.router.navigateByUrl('/');

		switch (swipe.direction) {
			case 'right':
				this.appService.shiftSchedule('previous');
				break;
			case 'left':
				this.appService.shiftSchedule('next');
				break;
		}
	}
}
