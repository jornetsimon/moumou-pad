import { ChangeDetectionStrategy, Component, TrackByFunction } from '@angular/core';
import { MealQuery } from './meal/state/meal.query';
import { Observable } from 'rxjs';
import { Meal } from './meal/state/meal.model';
import { DragDropService } from './meal/drag-drop.service';
import { map, startWith } from 'rxjs/operators';
import { NgxVibrationService } from 'ngx-vibration';

@Component({
	selector: 'cb-planning',
	templateUrl: './planning.component.html',
	styleUrls: ['./planning.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent {
	meals$: Observable<Meal[]> = this.mealQuery.getMealDays();
	showDragCancelButton$ = this.dragDropService.dragging$.pipe(
		map((dragging) => !!dragging),
		startWith(false)
	);
	trackByFn: TrackByFunction<Meal> = (index, item) => item.date.getTime();
	constructor(
		private mealQuery: MealQuery,
		private dragDropService: DragDropService,
		private vibrationService: NgxVibrationService
	) {}

	onDrop() {
		this.vibrationService.vibrate([150]);
	}
}
