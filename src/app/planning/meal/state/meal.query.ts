import { Injectable } from '@angular/core';
import { Order, QueryConfig, QueryEntity } from '@datorama/akita';
import { MealsStore, MealState } from './meals.store';
import { map } from 'rxjs/operators';
import { eachDayOfInterval, fromUnixTime, isSameDay } from 'date-fns';
import { createMeal, Meal, MealType } from './meal.model';
import { Period } from '../../../model/period';

@QueryConfig({ sortBy: 'date', sortByOrder: Order.ASC })
@Injectable({ providedIn: 'root' })
export class MealQuery extends QueryEntity<MealState> {
	constructor(protected store: MealsStore) {
		super(store);
	}

	getMealDays(period: Period) {
		const days = eachDayOfInterval({
			start: period.from,
			end: period.to,
		});
		const slots = days.reduce((acc: Array<{ date: Date; type: MealType }>, date) => {
			return acc.concat([
				{ date, type: 'lunch' },
				{ date, type: 'dinner' },
			]);
		}, []);

		return this.selectAll().pipe(
			map((meals): Meal[] => {
				return slots.map((slot): Meal => {
					const matchedMeal = meals.find(
						(meal) =>
							meal.type === slot.type &&
							isSameDay(fromUnixTime(meal.timestamp), slot.date)
					);
					return createMeal({
						...matchedMeal,
						jowRecipe: matchedMeal?.jowRecipe || null,
						date: slot.date,
						type: slot.type,
					});
				});
			})
		);
	}
}
