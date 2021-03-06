import { format, fromUnixTime, getHours, isSameDay } from 'date-fns';
import { Recipe } from '../../../model/receipe';

export type MealType = 'lunch' | 'dinner';
export type Dish = {
	name?: string | null;
	jowRecipe?: Recipe | null;
};

export interface Meal {
	id: string;
	date: Date;
	type: MealType;
	timestamp: number;
	name?: string | null;
	jowRecipe: Recipe | null;
	extras?: MealExtras;
	alternateDish?: Dish;
	recipeMemo?: string | null;
	searchKeys: string[];
}
export interface MealExtras {
	croquettes?: boolean;
	freezer?: boolean;
	outOfHome?: boolean;
	prepared?: boolean;
}

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
