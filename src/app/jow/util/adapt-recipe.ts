import { Recipe } from '../../model/receipe';

export function adaptRecipe(recipe: Recipe): Recipe {
	const smartColor =
		recipe.backgroundColor && recipe.backgroundColor.toLowerCase() !== '#ffffff'
			? recipe.backgroundColor
			: recipe.backgroundPattern.color;
	return { ...recipe, smartColor };
}
