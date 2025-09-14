import { Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { getFirestoreConverter } from '../../../../utils/firestore-converter';
import { MealThemeEntry } from './meal-theme.model';

@Injectable({
	providedIn: 'root',
})
export class MealThemeService {
	constructor(private firestore: Firestore) {}

	mealThemes$: Observable<MealThemeEntry[]> = collectionData(
		collection(this.firestore, '/meal-themes').withConverter(
			getFirestoreConverter<MealThemeEntry>()
		)
	);
}
