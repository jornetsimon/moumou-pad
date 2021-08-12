import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Meal } from './meal.model';
import { fromUnixTime } from 'date-fns';

export interface MealState extends EntityState<Meal> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'meals', resettable: true })
export class MealsStore extends EntityStore<MealState> {
	constructor() {
		super();
	}

	akitaPreAddEntity(meal: Meal) {
		const src = meal.timestamp as any;
		const timestamp = typeof src === 'number' ? src : src.seconds;
		const date = fromUnixTime(timestamp);
		return { ...meal, date };
	}
}
