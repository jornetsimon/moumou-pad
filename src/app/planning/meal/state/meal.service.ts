import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Meal } from './meal.model';
import { MealStore } from './meal.store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MealQuery } from './meal.query';

@Injectable({ providedIn: 'root' })
export class MealService {
	constructor(
		private mealStore: MealStore,
		private mealQuery: MealQuery,
		private storage: StorageMap
	) {}

	get() {
		return this.storage.get('meals').pipe(
			tap((entities) => {
				this.mealStore.set(entities as Meal[]);
			})
		);
	}

	add(meal: Meal) {
		this.mealStore.add(meal);
		this.storage.set('meals', this.mealQuery.getAll()).subscribe(() => {});
	}

	update(id: Date, meal: Partial<Meal>) {
		this.mealStore.update(id, meal);
		this.storage.set('meals', this.mealQuery.getAll()).subscribe(() => {});
	}

	remove(id: Date) {
		this.mealStore.remove(id);
	}
}
