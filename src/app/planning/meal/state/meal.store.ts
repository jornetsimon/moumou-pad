import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Meal } from './meal.model';

export interface MealState extends EntityState<Meal> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'meal', idKey: 'date' })
export class MealStore extends EntityStore<MealState> {
	constructor() {
		super();
	}
}
