import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MealsStore, MealState } from './meals-store.service';
import { now$ } from '../../../model/weekday';
import { map } from 'rxjs/operators';
import { eachDayOfInterval, endOfWeek, fromUnixTime, isSameDay, startOfWeek } from 'date-fns';
import { combineLatest } from 'rxjs';
import { createMeal, Meal, MealType } from './meal.model';

@Injectable({ providedIn: 'root' })
export class MealQuery extends QueryEntity<MealState> {
	constructor(protected store: MealsStore) {
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
		const slots$ = days$.pipe(
			map((days) =>
				days.reduce((acc: Array<{ date: Date; type: MealType }>, date) => {
					return acc.concat([
						{ date, type: 'lunch' },
						{ date, type: 'dinner' },
					]);
				}, [])
			)
		);
		return combineLatest([slots$, this.selectAll()]).pipe(
			map(([slots, meals]): Meal[] => {
				return slots.map((slot): Meal => {
					const matchedMeal = meals.find(
						(meal) =>
							meal.type === slot.type &&
							isSameDay(fromUnixTime(meal.timestamp), slot.date)
					);
					return createMeal({ ...matchedMeal, date: slot.date, type: slot.type });
				});
			})
		);
	}
}
