import { ChangeDetectionStrategy, Component, TrackByFunction } from '@angular/core';
import { MealQuery } from './meal/state/meal.query';
import { Observable } from 'rxjs';
import { Meal } from './meal/state/meal.model';

@Component({
	selector: 'cb-planning',
	templateUrl: './planning.component.html',
	styleUrls: ['./planning.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent {
	meals$: Observable<Meal[]> = this.mealQuery.getMealDays();
	trackByFn: TrackByFunction<Meal> = (index, item) => item.date.getTime();

	constructor(private mealQuery: MealQuery) {}
}
