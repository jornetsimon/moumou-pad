import { Injectable } from '@angular/core';
import { Order, QueryConfig, QueryEntity } from '@datorama/akita';
import { MealsStore, MealState } from './meals.store';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { eachDayOfInterval, fromUnixTime, isSameDay } from 'date-fns';
import { createMeal, Meal, MealType } from './meal.model';
import { Period } from '../../model/period';
import { Observable } from 'rxjs';
import {
	collection,
	collectionData,
	Firestore,
	limit,
	orderBy,
	query,
	where,
} from '@angular/fire/firestore';
import { AppQuery } from '../../../state/app.query';
import { CollectionReference } from '@firebase/firestore';
import { Recipe } from '../../model/receipe';

@QueryConfig({ sortBy: 'date', sortByOrder: Order.ASC })
@Injectable({ providedIn: 'root' })
export class MealQuery extends QueryEntity<MealState> {
	constructor(
		protected store: MealsStore,
		protected firestore: Firestore,
		private appQuery: AppQuery
	) {
		super(store);
	}

	nameSuggestions$: Observable<string[]> = this.appQuery.targetPath$.pipe(
		switchMap((targetPath) =>
			collectionData(
				query(
					collection(this.firestore, `${targetPath}/most-used`) as CollectionReference<{
						name: string;
						count: number;
					}>,
					where('count', '>', 0),
					orderBy('count', 'desc'),
					limit(5)
				)
			)
		),
		map((suggestions) => suggestions.map((s) => s.name)),
		shareReplay(1)
	);

	lessUsedRecipes$: Observable<Array<Recipe & { useCount: number }>> =
		this.appQuery.targetPath$.pipe(
			switchMap((targetPath) =>
				collectionData(
					query(
						collection(
							this.firestore,
							`${targetPath}/most-used-recipes`
						) as CollectionReference<{
							recipe: Recipe;
							count: number;
						}>,
						where('count', '>', 0),
						orderBy('count', 'asc'),
						limit(25)
					)
				)
			),
			map((elements) => elements.map((s) => ({ ...s.recipe, useCount: s.count }))),
			shareReplay(1)
		);

	getMealDays(period: Period) {
		const days = eachDayOfInterval({
			start: period.from,
			end: period.to,
		});
		const slots = days.reduce((acc: Array<{ date: Date; type: MealType }>, date) => {
			return acc.concat([
				{ date, type: 'lunch' },
				{ date, type: 'dinner' },
			]);
		}, []);

		return this.selectAll().pipe(
			map((meals): Meal[] => {
				return slots.map((slot): Meal => {
					const matchedMeal = meals.find(
						(meal) =>
							meal.type === slot.type &&
							isSameDay(fromUnixTime(meal.timestamp), slot.date)
					);
					return createMeal({
						...matchedMeal,
						jowRecipe: matchedMeal?.jowRecipe || null,
						date: slot.date,
						type: slot.type,
					});
				});
			})
		);
	}
}
