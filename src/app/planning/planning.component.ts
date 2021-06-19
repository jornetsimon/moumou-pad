import { ChangeDetectionStrategy, Component, OnInit, TrackByFunction } from '@angular/core';
import { MealService } from './meal/state/meal.service';
import { MealQuery } from './meal/state/meal.query';
import { Observable } from 'rxjs';
import { Meal } from './meal/state/meal.model';

@Component({
	selector: 'cb-planning',
	templateUrl: './planning.component.html',
	styleUrls: ['./planning.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent implements OnInit {
	meals$: Observable<Meal[]>;
	trackByFn: TrackByFunction<Meal> = (index, item) => item.date.getTime();

	constructor(private mealService: MealService, private mealQuery: MealQuery) {
		// Subscribe to the collection
		this.mealService.syncCollection().subscribe();
		// Get the list from the store
		this.meals$ = this.mealQuery.getMealDays();
	}

	ngOnInit(): void {}
}
