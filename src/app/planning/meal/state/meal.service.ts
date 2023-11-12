import { Injectable } from '@angular/core';
import { MealsStore } from './meals.store';
import { AppQuery } from '../../../../state/app.query';
import { Meal } from './meal.model';
import { mapUndefinedToNull } from '../../../../utils/mapUndefinedToNull';
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
import { CollectionReference } from '@firebase/firestore';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { AppService } from '../../../../state/app.service';
import { combineLatest } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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
		map(
			(targetPath) =>
				collection(this.firestore, `${targetPath}/meals`) as CollectionReference<Meal>
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
				collectionData(
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

		return this.collectionRef$
			.pipe(
				switchMap((collectionRef) => setDoc(doc(collectionRef, entity.id), entity)),
				map(() => id)
			)
			.toPromise();
	}

	update(id: string, entity: Partial<Meal>): Promise<void> {
		return this.collectionRef$
			.pipe(
				switchMap((collectionRef) =>
					setDoc(doc(collectionRef, id), entity, { merge: true })
				)
			)
			.toPromise();
	}

	get path() {
		return `${this.appQuery.getTargetPath()}/meals`;
	}

	swapMeals(from: Meal, to: Meal) {
		const batch = writeBatch(this.firestore);
		const destination = {
			...to,
			name: from.name || null,
			jowRecipe: from.jowRecipe || null,
			extras: mapUndefinedToNull({ ...from.extras, croquettes: to.extras?.croquettes }),
			alternateDish: from.alternateDish,
		};
		const source = {
			...from,
			name: to.name || null,
			jowRecipe: to.jowRecipe || null,
			extras: mapUndefinedToNull({ ...to.extras, croquettes: from.extras?.croquettes }),
			alternateDish: to.alternateDish,
		};
		batch.set(doc(this.firestore, to.id), mapUndefinedToNull(destination));
		batch.set(doc(this.firestore, from.id), mapUndefinedToNull(source));
		return batch.commit();
	}
}
