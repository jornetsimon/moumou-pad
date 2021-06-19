import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MealState, MealStore } from './meal.store';
import { now$ } from '../../../model/weekday';
import { map } from 'rxjs/operators';
import { eachDayOfInterval, endOfWeek, isSameDay, startOfWeek } from 'date-fns';
import { combineLatest } from 'rxjs';
import { Meal } from './meal.model';

@Injectable({ providedIn: 'root' })
export class MealQuery extends QueryEntity<MealState> {
	constructor(protected store: MealStore) {
		super(store);
	}

	getMealDays() {
		const days$ = now$.pipe(
			map((now) =>
				eachDayOfInterval({
					start: startOfWeek(now, { weekStartsOn: 1 }),
					end: endOfWeek(now, { weekStartsOn: 1 }),
				})
			)
		);
		return combineLatest([days$, this.selectAll()]).pipe(
			map(([days, meals]): Meal[] => {
				return days.map((day): Meal => {
					const matchedMeal = meals.find((meal) => isSameDay(meal.date, day));
					return {
						date: day,
						name: matchedMeal?.name,
					};
				});
			})
		);
	}
}
