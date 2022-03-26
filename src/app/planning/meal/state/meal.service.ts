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
		return `${this.appQuery.getTargetPath()}/meals`;
	}

	swapMeals(from: Meal, to: Meal) {
		const batch = this.batch();
		batch.set(this.getRef(to.id), {
			...to,
			name: from.name || null,
			jowRecipe: from.jowRecipe || null,
			extras: from.extras ? { ...from.extras, croquettes: to.extras?.croquettes } : null,
			alternateDish: from.alternateDish,
		});
		batch.set(this.getRef(from.id), {
			...from,
			name: to.name || null,
			jowRecipe: to.jowRecipe || null,
			extras: to.extras ? { ...to.extras, croquettes: from.extras?.croquettes } : null,
			alternateDish: to.alternateDish,
		});
		return batch.commit();
	}
}
