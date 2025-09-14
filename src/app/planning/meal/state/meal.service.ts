import { Injectable } from '@angular/core';
import {
	collection,
	collectionData,
	doc,
	Firestore,
	query,
	setDoc,
	where,
	writeBatch,
} from '@angular/fire/firestore';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, firstValueFrom } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { AppQuery } from '../../../../state/app.query';
import { AppService } from '../../../../state/app.service';
import { getFirestoreConverter } from '../../../../utils/firestore-converter';
import { mapUndefinedToNull } from '../../../../utils/map-undefined-to-null';
import { Meal } from './meal.model';
import { MealsStore } from './meals.store';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class MealService {
	constructor(
		private readonly store: MealsStore,
		private readonly appQuery: AppQuery,
		private readonly appService: AppService,
		private readonly firestore: Firestore
	) {
		this.syncCollection().pipe(untilDestroyed(this)).subscribe();
	}

	private readonly collectionRef$ = this.appQuery.targetPath$.pipe(
		map((targetPath) =>
			collection(this.firestore, `${targetPath}/meals`).withConverter(
				getFirestoreConverter<Meal>()
			)
		)
	);

	syncCollection() {
		const syncFromDate$ = this.appQuery.select('user').pipe(
			filter((user) => !!user),
			switchMap((user) => this.appService.fetchConfig(user!.uid)),
			switchMap(() => this.appQuery.select('syncFromDate'))
		);

		return combineLatest([this.collectionRef$, syncFromDate$]).pipe(
			switchMap(([collectionRef, syncFromDate]) =>
				collectionData<Meal>(
					query(collectionRef, where('timestamp', '>=', syncFromDate.getTime() / 1000))
				)
			),
			tap((meals) => this.store.upsertMany(meals))
		);
	}

	add(entity: Partial<Meal>): Promise<string> {
		const id = entity.id;
		if (!id) {
			throw new Error('id is required');
		}

		return firstValueFrom(
			this.collectionRef$.pipe(
				switchMap((collectionRef) => setDoc(doc(collectionRef, entity.id), entity)),
				map(() => id)
			)
		);
	}

	update(id: string, entity: Partial<Meal>): Promise<void> {
		return firstValueFrom(
			this.collectionRef$.pipe(
				switchMap((collectionRef) =>
					setDoc(doc(collectionRef, id), entity, { merge: true })
				)
			)
		);
	}

	get path() {
		return `${this.appQuery.getTargetPath()}/meals`;
	}

	swapMeals(from: Meal, to: Meal) {
		return firstValueFrom(
			this.collectionRef$.pipe(
				map((collectionRef) => {
					const batch = writeBatch(this.firestore);
					const destination = {
						...to,
						name: from.name || null,
						jowRecipe: from.jowRecipe || null,
						extras: mapUndefinedToNull({
							...from.extras,
						}),
						emojis: from.emojis,
					} satisfies Meal;

					const source = {
						...from,
						name: to.name || null,
						jowRecipe: to.jowRecipe || null,
						extras: mapUndefinedToNull({
							...to.extras,
						}),
						emojis: to.emojis,
					} satisfies Meal;

					batch.set(doc(collectionRef, to.id), mapUndefinedToNull(destination));
					batch.set(doc(collectionRef, from.id), mapUndefinedToNull(source));
					return batch.commit();
				})
			)
		);
	}
}
