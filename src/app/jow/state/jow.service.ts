import { Injectable } from '@angular/core';
import { JowStore } from './jow.store';
import { from, Observable } from 'rxjs';
import { Recipe } from '../../model/receipe';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { map } from 'rxjs/operators';
import { adaptRecipe } from '../util';

@Injectable({ providedIn: 'root' })
export class JowService {
	constructor(
		private readonly jowStore: JowStore,
		private readonly fns: Functions
	) {}

	fetchFeatured() {
		const callable = httpsCallable<{}, Recipe[]>(this.fns, 'jowFeaturedRecipes');
		from(callable({}))
			.pipe(
				map((res) => res.data),
				map((recipes) => recipes.map(adaptRecipe))
			)
			.subscribe((recipes) => {
				this.jowStore.update({ featured: recipes });
			});
	}

	getRecipe(id: string): Observable<Recipe> {
		const callable = httpsCallable<{ id: string }, Recipe>(this.fns, 'jowRecipe');
		return from(callable({ id })).pipe(
			map((res) => res.data),
			map(adaptRecipe)
		);
	}

	search(term: string): Observable<Recipe[]> {
		const callable = httpsCallable<{ term: string }, Recipe[]>(this.fns, 'jowRecipeSearch');
		return from(callable({ term })).pipe(
			map((res) => res.data),
			map((recipes) => recipes.map(adaptRecipe))
		);
	}
}
