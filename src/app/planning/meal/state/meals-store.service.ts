import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Meal } from './meal.model';
import { fromUnixTime } from 'date-fns';

export interface MealState extends EntityState<Meal> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'meals', idKey: 'id' })
export class MealsStore extends EntityStore<MealState> {
	constructor() {
		super();
	}

	akitaPreAddEntity(meal: Meal) {
		const date = fromUnixTime(meal.timestamp);
		return { ...meal, date };
	}
}
