export interface MealThemeModel {
	color?: string;
	backgroundImage?: string;
	emoji?: string;
	shadow?: boolean;
}
export interface MealThemeEntry {
	keywords: string[];
	theme: MealThemeModel;
}
