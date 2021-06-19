import { format } from 'date-fns';

export type MealType = 'lunch' | 'dinner';

export interface Meal {
	id: string;
	date: Date;
	type: MealType;
	timestamp: number;
	name?: string;
	jowRecipeId?: string;
}

export function createMeal(input: {
	date: Date;
	type: MealType;
	name?: string;
	jowRecipeId?: string;
}): Meal {
	return {
		id: format(input.date, `yyyy-MM-dd-`) + input.type,
		...input,
		timestamp: input.date.getTime() / 1000,
	};
}
