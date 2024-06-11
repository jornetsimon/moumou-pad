import { Injectable, signal } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MealIdea } from '@functions/model/meal-idea.model';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable({
	providedIn: 'root',
})
export class MealIdeasService {
	constructor(private readonly fns: Functions) {}

	readonly ideas = signal<MealIdea[]>([]);

	async fetchIdeas() {
		const callable = httpsCallable<{}, MealIdea[]>(this.fns, 'notionIdeas');
		const response = await callable({});
		this.ideas.set(response.data);
	}
}
