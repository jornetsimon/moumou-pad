import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JowStore } from './jow.store';
import { Observable } from 'rxjs';
import { Recipe } from '../../model/receipe';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({ providedIn: 'root' })
export class JowService {
	constructor(
		private jowStore: JowStore,
		private http: HttpClient,
		private fns: AngularFireFunctions
	) {}

	fetchFeatured() {
		const callable = this.fns.httpsCallable('jowFeaturedRecipes');
		(callable({}) as Observable<Recipe[]>).subscribe((recipes) => {
			this.jowStore.update({ featured: recipes });
		});
	}

	getRecipe(id: string): Observable<Recipe> {
		const callable = this.fns.httpsCallable('jowRecipe');
		return callable({ id });
	}

	search(term: string): Observable<Recipe[]> {
		const callable = this.fns.httpsCallable('jowRecipeSearch');
		return callable({ term });
	}

	constructAssetUrl(asset: string) {
		return `https://static.jow.fr/${asset}`;
	}
	constructRecipeUrl(recipeId: string) {
		return `https://jow.fr/recettes/${recipeId}`;
	}
}
