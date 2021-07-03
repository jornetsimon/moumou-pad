import { Injectable } from '@angular/core';
import { CollectionService } from 'akita-ng-fire';
import { MealsStore, MealState } from './meals-store.service';
import { AppQuery } from '../../../../state/app.query';

@Injectable({ providedIn: 'root' })
export class MealService extends CollectionService<MealState> {
	constructor(store: MealsStore, private appQuery: AppQuery) {
		super(store);
	}

	get path() {
		const userId = this.appQuery.getValue().user!.uid;
		return `users/${userId}/meals`;
	}
}
