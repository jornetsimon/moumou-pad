import { format, fromUnixTime, getHours, isSameDay } from 'date-fns';
import { Dish, Meal, MealExtras, MealType } from '@functions/model/meal.model';
import { Recipe } from '@functions/model/receipe.model';

export type { Meal, MealExtras, MealType, Dish } from '@functions/model/meal.model';

export function createMeal(input: {
	date: Date;
	type: MealType;
	name?: string | null;
	jowRecipe: Recipe | null;
	extras?: MealExtras;
	alternateDish?: Dish;
	recipeMemo?: string | null;
}): Meal {
	return {
		id: format(input.date, `yyyy-MM-dd-`) + input.type,
		...input,
		timestamp: input.date.getTime() / 1000,
		alternateDish: input.alternateDish,
		searchKeys: [],
	};
}

export function addDateToMeal(meal: Meal): Meal {
	const src = meal.timestamp as any;
	const timestamp = typeof src === 'number' ? src : src.seconds;
	const date = fromUnixTime(timestamp);
	return { ...meal, date };
}

export function isNextMeal(meal: Meal): boolean {
	const now = Date.now();
	const isMealToday = isSameDay(meal.date, now);
	const currentHour = getHours(now);
	if (isMealToday) {
		const matchesLunch = currentHour < 14 && meal.type === 'lunch';
		const matchesDinner = currentHour >= 14 && meal.type === 'dinner';
		return matchesLunch || matchesDinner;
	}
	return false;
}
