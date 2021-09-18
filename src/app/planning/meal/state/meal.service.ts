import { Injectable } from '@angular/core';
import { CollectionService } from 'akita-ng-fire';
import { MealsStore, MealState } from './meals.store';
import { AppQuery } from '../../../../state/app.query';
import { Meal } from './meal.model';

@Injectable({ providedIn: 'root' })
export class MealService extends CollectionService<MealState> {
	constructor(store: MealsStore, private appQuery: AppQuery) {
		super(store);
	}

	get path() {
		const stateSnapshot = this.appQuery.getValue();
		const userData = stateSnapshot.userData;
		const familyName = userData?.familyName;
		const isAllowedInFamily = userData?.isAllowedInFamily;
		const userId = stateSnapshot.user!.uid;

		if (familyName && isAllowedInFamily) {
			return `families/${familyName}/meals`;
		}
		return `users/${userId}/meals`;
	}

	swapMeals(from: Meal, to: Meal) {
		const batch = this.batch();
		batch.set(this.getRef(to.id), {
			...to,
			name: from.name || null,
			jowRecipe: from.jowRecipe || null,
			extras: from.extras || null,
			alternateDish: from.alternateDish,
		});
		batch.set(this.getRef(from.id), {
			...from,
			name: to.name || null,
			jowRecipe: to.jowRecipe || null,
			extras: to.extras || null,
			alternateDish: to.alternateDish,
		});
		return batch.commit();
	}
}
