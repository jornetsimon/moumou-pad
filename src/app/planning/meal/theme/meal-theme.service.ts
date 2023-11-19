import { Injectable } from '@angular/core';
import { MealThemeEntry } from './meal-theme.model';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { CollectionReference } from '@firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class MealThemeService {
	constructor(private firestore: Firestore) {}
	mealThemes$: Observable<MealThemeEntry[]> = collectionData<MealThemeEntry>(
		collection(this.firestore, '/meal-themes') as CollectionReference<MealThemeEntry>
	);
}
