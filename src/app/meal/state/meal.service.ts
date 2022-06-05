import { Injectable } from '@angular/core';
import { CollectionService } from 'akita-ng-fire';
import { MealsStore, MealState } from './meals.store';
import { AppQuery } from '../../../state/app.query';
import { Meal } from './meal.model';
import { mapUndefinedToNull } from '../../../utils/mapUndefinedToNull';

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
		const destination = {
			...to,
			name: from.name || null,
			jowRecipe: from.jowRecipe || null,
			extras: mapUndefinedToNull({ ...from.extras, croquettes: to.extras?.croquettes }),
			alternateDish: from.alternateDish,
		};
		const source = {
			...from,
			name: to.name || null,
			jowRecipe: to.jowRecipe || null,
			extras: mapUndefinedToNull({ ...to.extras, croquettes: from.extras?.croquettes }),
			alternateDish: to.alternateDish,
		};
		batch.set(this.getRef(to.id), mapUndefinedToNull(destination));
		batch.set(this.getRef(from.id), mapUndefinedToNull(source));
		return batch.commit();
	}
}
