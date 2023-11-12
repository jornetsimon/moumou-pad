import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { addDateToMeal, Meal } from './meal.model';

export interface MealState extends EntityState<Meal> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'meals', resettable: true })
export class MealsStore extends EntityStore<MealState> {
	constructor() {
		super();
	}

	akitaPreUpdate(meal: Meal) {
		return addDateToMeal(meal);
	}
}
