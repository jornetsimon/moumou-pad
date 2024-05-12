import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { MealIdea } from '@functions/model/meal-idea.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debugObservable } from '../../utils/debug-observable';

@UntilDestroy()
@Injectable({
	providedIn: 'root',
})
export class IdeasService {
	constructor(private readonly fns: Functions) {}

	fetchIdeas() {
		const callable = httpsCallable<{}, MealIdea[]>(this.fns, 'notionIdeas');
		from(callable({}))
			.pipe(
				map((res) => res.data),
				debugObservable('ideas'),
				untilDestroyed(this)
			)
			.subscribe();
	}
}
