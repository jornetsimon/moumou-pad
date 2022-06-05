import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchError, filter, first, map } from 'rxjs/operators';
import { formatISO, isSameDay, parseISO } from 'date-fns/esm';
import { combineLatest, Observable, of } from 'rxjs';
import { MealQuery } from './planning/meal/state/meal.query';
import { Meal } from './planning/meal/state/meal.model';
import { isNotNullOrUndefined } from './shared/utilities';

@Injectable({
	providedIn: 'root',
})
export class CroquettesService {
	constructor(private storage: StorageMap, private mealQuery: MealQuery) {}

	private LOCAL_DB_KEY = 'croquettes_last_display_date';

	private mealsToday$: Observable<Meal[]> = this.mealQuery.selectAll().pipe(
		first((meals) => !!meals.length),
		map((meals) => meals.filter((meal) => isSameDay(meal.date, Date.now())))
	);

	alreadyDisplayedForToday$: Observable<boolean> = this.storage
		.get<string>(this.LOCAL_DB_KEY, { type: 'string' })
		.pipe(
			catchError(() => of(undefined)),
			map((lastDisplayDate) => {
				if (!lastDisplayDate) {
					return false;
				}
				return isSameDay(parseISO(lastDisplayDate), Date.now());
			})
		);

	markAsDisplayed() {
		return this.storage.set(this.LOCAL_DB_KEY, formatISO(Date.now())).subscribe();
	}

	prompt$: Observable<Meal> = combineLatest([
		this.mealsToday$,
		this.alreadyDisplayedForToday$,
	]).pipe(
		first(),
		map(([mealsToday, alreadyDisplayedForToday]): Meal | undefined =>
			!alreadyDisplayedForToday
				? mealsToday.find((meal) => meal.extras?.croquettes)
				: undefined
		),
		filter(isNotNullOrUndefined)
	);
}
