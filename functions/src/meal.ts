import * as functions from 'firebase-functions';
import { db } from './init';
import { Dish, Meal, Recipe } from './model/meal.model';
import { PickByType } from './helpers/pick-by-type';
import { RecursiveKeyOf } from './helpers/recursive-key-of';
import { normalizeString } from './helpers/normalize-string';
import get = require('lodash/get');
import uniq = require('lodash/uniq');

export const createMeal = functions
	.region('europe-west1')
	.firestore.document('users/{userId}/meals/{mealId}')
	.onWrite((change, context) => {
		if (!change.after.exists) {
			// The document has been deleted
			return;
		}
		const meal = change.after.data() as Meal;
		const searchKeys = generateMealSearchKeys(meal);
		db.doc(change.after.ref.path).update({ searchKeys });
	});

function generateMealSearchKeys(meal: Meal): Meal['searchKeys'] {
	const keys: Array<AllowedSearchKey> = [
		'name',
		'recipeMemo',
		'jowRecipe.title',
		'jowRecipe.composition',
		'jowRecipe.keywords',
		'alternateDish.jowRecipe.title',
		'alternateDish.jowRecipe.composition',
		'alternateDish.jowRecipe.keywords',
	];
	const values: string[] = keys
		.map((key) => get(meal, key))
		.filter((val) => !!val && typeof val === 'string');
	const splitValues = values
		.map((val) =>
			`${val}`
				.split(' ')
				.filter((val) => val.length > 1)
				.map((val) => val.replace(',', ''))
				.map(normalizeString)
		)
		.flat();
	return uniq(splitValues);
}

type AllowedSearchKey =
	| Exclude<keyof PickByType<Meal, string | null>, 'searchKeys'>
	| `jowRecipe.${RecursiveKeyOf<Recipe, string>}`
	| `alternateDish.${keyof Dish['name']}`
	| `alternateDish.jowRecipe.${RecursiveKeyOf<Recipe, string>}`;
