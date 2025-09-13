import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	collection,
	collectionData,
	deleteDoc,
	doc,
	Firestore,
	query,
	setDoc,
} from '@angular/fire/firestore';
import { CollectionReference } from '@firebase/firestore';
import { Suggestion } from '@functions/model/suggestion.model';
import { firstValueFrom, Observable } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { AppQuery } from '../../state/app.query';
import { getFirestoreConverter } from '../../utils/firestore-converter';
import { isNotNullOrUndefined } from '../shared/utilities';
import { SuggestionStore } from './suggestion-store.service';

@Injectable({
	providedIn: 'root',
})
export class SuggestionService {
	constructor(
		private readonly store: SuggestionStore,
		private readonly firestore: Firestore,
		private readonly appQuery: AppQuery
	) {
		this.syncCollection().pipe(takeUntilDestroyed()).subscribe();
	}

	private readonly collectionRef$: Observable<CollectionReference<Suggestion>> =
		this.appQuery.userData$.pipe(
			filter(isNotNullOrUndefined),
			map(({ familyName, isAllowedInFamily }) => {
				if (!(familyName && isAllowedInFamily)) {
					return null;
				}

				return collection(
					this.firestore,
					`families/${familyName}/suggestions`
				).withConverter(getFirestoreConverter<Suggestion>());
			}),
			filter(isNotNullOrUndefined)
		);

	fetch() {
		return this.syncCollection().pipe(first());
	}

	syncCollection() {
		return this.collectionRef$.pipe(
			switchMap((collectionRef) => collectionData(query(collectionRef))),
			tap((suggestions) => this.store.set(suggestions))
		);
	}

	add(entity: Partial<Suggestion>): Promise<string> {
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

	delete(id: string): Promise<void> {
		return firstValueFrom(
			this.collectionRef$.pipe(
				switchMap((collectionRef) => deleteDoc(doc(collectionRef, id)))
			)
		);
	}
}
