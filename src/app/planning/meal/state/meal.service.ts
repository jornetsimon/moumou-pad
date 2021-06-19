import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { MealsStore, MealState } from './meals-store.service';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'meals' })
export class MealService extends CollectionService<MealState> {
	constructor(store: MealsStore) {
		super(store);
	}
}
