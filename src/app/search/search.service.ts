import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { map } from 'rxjs/operators';
import { addDateToMeal, Meal } from '../planning/meal/state/meal.model';

@Injectable({
	providedIn: 'root',
})
export class SearchService {
	constructor(private fns: Functions) {}

	search(term: string): Observable<Meal[]> {
		const callable = httpsCallable<{ term: string }, Meal[]>(this.fns, 'search');
		return from(callable({ term })).pipe(map((res) => res.data.map(addDateToMeal)));
	}
}
