import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MealThemeEntry } from './meal-theme.model';

@Injectable({
	providedIn: 'root',
})
export class MealThemeService {
	constructor(private afs: AngularFirestore) {}
	mealThemes$ = this.afs.collection<MealThemeEntry>('/meal-themes').valueChanges();
}
