import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../model/receipe';

@Injectable({
	providedIn: 'root',
})
export class JowService {
	private baseUrl = 'https://api.jow.fr/public';

	constructor(private http: HttpClient) {}

	getRecipe(id: string) {
		return this.http.get<Recipe>(`${this.baseUrl}/recipe/${id}`);
	}

	search(term: string) {
		return this.http.get<Recipe[]>(`${this.baseUrl}/recipe/quicksearch?query=${term}`);
	}

	getFeatured() {
		return this.http.get<Recipe[]>(`${this.baseUrl}/recipes/featured`);
	}
}
