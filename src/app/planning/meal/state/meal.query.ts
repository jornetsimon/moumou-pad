import { Injectable } from '@angular/core';
import {
	collection,
	collectionData,
	Firestore,
	limit,
	orderBy,
	query,
	where,
} from '@angular/fire/firestore';
import { Order, QueryConfig, QueryEntity } from '@datorama/akita';
import { eachDayOfInterval, fromUnixTime, isSameDay } from 'date-fns';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { AppQuery } from '../../../../state/app.query';
import { getFirestoreConverter } from '../../../../utils/firestore-converter';
import { adaptRecipe } from '../../../jow/util';
import { Period } from '../../../model/period';
import { Recipe } from '../../../model/receipe';
import { createMeal, Meal, MealType } from './meal.model';
import { MealsStore, MealState } from './meals.store';

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
					collection(this.firestore, `${targetPath}/most-used`).withConverter(
						getFirestoreConverter<{
							name: string;
							count: number;
						}>()
					),
					where('count', '>', 0),
					orderBy('count', 'desc'),
					limit(5)
				)
			)
		),
		map((suggestions) => suggestions.map(({ name }) => name)),
		shareReplay(1)
	);

	lessUsedRecipes$: Observable<Array<Recipe & { useCount: number }>> =
		this.appQuery.targetPath$.pipe(
			switchMap((targetPath) =>
				collectionData(
					query(
						collection(this.firestore, `${targetPath}/most-used-recipes`).withConverter(
							getFirestoreConverter<{
								recipe: Recipe;
								count: number;
							}>()
						),
						where('count', '>', 0),
						orderBy('count', 'asc'),
						limit(25)
					)
				)
			),
			map((elements) =>
				elements.map(({ recipe, count }) => ({ ...adaptRecipe(recipe), useCount: count }))
			),
			shareReplay(1)
		);

	mostUsedRecipes$: Observable<Array<Recipe & { useCount: number }>> =
		this.appQuery.targetPath$.pipe(
			switchMap((targetPath) =>
				collectionData(
					query(
						collection(this.firestore, `${targetPath}/most-used-recipes`).withConverter(
							getFirestoreConverter<{
								recipe: Recipe;
								count: number;
							}>()
						),
						where('count', '>', 0),
						orderBy('count', 'desc'),
						limit(30)
					)
				)
			),

			map((elements) =>
				elements.map(({ recipe, count }) => ({ ...adaptRecipe(recipe), useCount: count }))
			),
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
