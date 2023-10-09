import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JowStore } from './jow.store';
import { from, Observable } from 'rxjs';
import { Recipe } from '../../model/receipe';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class JowService {
	constructor(private jowStore: JowStore, private http: HttpClient, private fns: Functions) {}

	fetchFeatured() {
		const callable = httpsCallable<{}, Recipe[]>(this.fns, 'jowFeaturedRecipes');
		from(callable({}))
			.pipe(
				map((res) => res.data),
				map((recipes) => recipes.map(this.adaptRecipe))
			)
			.subscribe((recipes) => {
				this.jowStore.update({ featured: recipes });
			});
	}

	getRecipe(id: string): Observable<Recipe> {
		const callable = httpsCallable<{ id: string }, Recipe>(this.fns, 'jowRecipe');
		return from(callable({ id })).pipe(
			map((res) => res.data),
			map((recipe) => this.adaptRecipe(recipe))
		);
	}

	search(term: string): Observable<Recipe[]> {
		const callable = httpsCallable<{ term: string }, Recipe[]>(this.fns, 'jowRecipeSearch');
		return from(callable({ term })).pipe(
			map((res) => res.data),
			map((recipes) => recipes.map(this.adaptRecipe))
		);
	}

	constructAssetUrl(asset: string | undefined): string {
		if (!asset) {
			return '';
		}
		return `https://static.jow.fr/${asset}`;
	}
	constructRecipeUrl(recipeId: string) {
		return `https://app.jow.com/nf5e/?action=recipe&recipeId=${recipeId}`;
	}

	private adaptRecipe(recipe: Recipe): Recipe {
		const smartColor =
			recipe.backgroundColor && recipe.backgroundColor.toLowerCase() !== '#ffffff'
				? recipe.backgroundColor
				: recipe.backgroundPattern.color;
		return { ...recipe, smartColor };
	}
}
