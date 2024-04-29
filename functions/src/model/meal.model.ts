import { Recipe } from './receipe.model';

export interface Meal {
	id: string;
	date: Date;
	type: MealType;
	timestamp: number;
	name?: string | null;
	jowRecipe: Recipe | null;
	extras?: MealExtras;
	recipeMemo?: string | null;
	searchKeys?: string[];
	emojis?: string[];
	lines?: MealLine[];
}

export type MealType = 'lunch' | 'dinner';

export interface MealExtras {
	outOfHome?: boolean;
	prepared?: boolean;
}

export interface MealLine {
	emoji?: string;
	text: string;
}
