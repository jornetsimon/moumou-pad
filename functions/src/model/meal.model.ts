import { Recipe } from './receipe.model';

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
	searchKeys?: string[];
	emojis?: string[];
}
export type MealType = 'lunch' | 'dinner';
export type Dish = {
	name?: string | null;
	jowRecipe?: Recipe | null;
};
export interface MealExtras {
	outOfHome?: boolean;
	prepared?: boolean;
}
