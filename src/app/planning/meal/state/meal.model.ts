import { format } from 'date-fns';
import { Recipe } from '../../../model/receipe';

export type MealType = 'lunch' | 'dinner';

export interface Meal {
	id: string;
	date: Date;
	type: MealType;
	timestamp: number;
	name?: string;
	jowRecipe: Recipe | null;
	extras?: MealExtras;
}
export interface MealExtras {
	croquettes: boolean;
	freezer: boolean;
	outOfHome: boolean;
}

export function createMeal(input: {
	date: Date;
	type: MealType;
	name?: string;
	jowRecipe: Recipe | null;
	extras?: MealExtras;
}): Meal {
	return {
		id: format(input.date, `yyyy-MM-dd-`) + input.type,
		...input,
		timestamp: input.date.getTime() / 1000,
	};
}
