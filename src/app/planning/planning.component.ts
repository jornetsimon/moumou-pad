import { ChangeDetectionStrategy, Component, OnInit, TrackByFunction } from '@angular/core';
import { MealService } from './meal/state/meal.service';
import { MealQuery } from './meal/state/meal.query';
import { Observable } from 'rxjs';
import { Meal } from './meal/state/meal.model';
import { JowService } from '../jow/state/jow.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
	selector: 'cb-planning',
	templateUrl: './planning.component.html',
	styleUrls: ['./planning.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningComponent implements OnInit {
	meals$: Observable<Meal[]> = this.mealQuery.getMealDays();
	trackByFn: TrackByFunction<Meal> = (index, item) => item.date.getTime();

	constructor(
		private mealService: MealService,
		private mealQuery: MealQuery,
		private jowService: JowService
	) {}

	ngOnInit() {
		// Subscribe to the Firestore collection
		this.mealService
			.syncCollection({
				reset: true,
			})
			.pipe(untilDestroyed(this))
			.subscribe();
		this.jowService.fetchFeatured();
	}
}
