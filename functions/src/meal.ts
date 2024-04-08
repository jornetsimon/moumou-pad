import * as functions from 'firebase-functions';
import { db } from './init';
import { Dish, Meal } from './model/meal.model';
import { PickByType } from './helpers/pick-by-type';
import { RecursiveKeyOf } from './helpers/recursive-key-of';
import { normalizeString } from './helpers/normalize-string';
import { firestore } from 'firebase-admin';
import { isNotNullOrUndefined } from './helpers/is-not-null-or-undefined.helper';
import slugify from 'slugify';
import { Change, EventContext } from 'firebase-functions/lib/cloud-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { Recipe } from './model/receipe.model';
import get = require('lodash/get');
import uniq = require('lodash/uniq');
import FieldValue = firestore.FieldValue;

export const createMeal = functions
	.region('europe-west1')
	.firestore.document('users/{targetId}/meals/{mealId}')
	.onWrite(onMealCreated('users'));

export const createFamilyMeal = functions
	.region('europe-west1')
	.firestore.document('families/{targetId}/meals/{mealId}')
	.onWrite(onMealCreated('families'));

export function onMealCreated(targetLocation: 'users' | 'families') {
	return (change: Change<DocumentSnapshot>, context: EventContext): void => {
		const mostUsedRef = db.collection(`${targetLocation}/${context.params.targetId}/most-used`);
		const mostUsedRecipesRef = db.collection(
			`${targetLocation}/${context.params.targetId}/most-used-recipes`
		);
		const mealBefore = change.before.exists ? (change.before.data() as Meal) : undefined;
		const mealAfter = change.after.exists ? (change.after.data() as Meal) : undefined;
		const removedNames: string[] = mealBefore ? getMealCustomNames(mealBefore) : [];
		const addedNames: string[] = mealAfter ? getMealCustomNames(mealAfter) : [];

		const batch = db.batch();

		removedNames
			.filter((name) => !addedNames.includes(name))
			.forEach((name) => {
				batch.set(
					mostUsedRef.doc(slugify(name, { lower: true })),
					{
						name,
						count: FieldValue.increment(-1),
					},
					{
						merge: true,
					}
				);
			});
		addedNames
			.filter((name) => !removedNames.includes(name))
			.forEach((name) => {
				batch.set(
					mostUsedRef.doc(slugify(name, { lower: true })),
					{
						name,
						count: FieldValue.increment(1),
					},
					{
						merge: true,
					}
				);
			});

		if (mealBefore?.jowRecipe?._id !== mealAfter?.jowRecipe?._id) {
			if (mealBefore?.jowRecipe) {
				batch.set(
					mostUsedRecipesRef.doc(mealBefore.jowRecipe._id),
					{
						count: FieldValue.increment(-1),
						recipe: mealBefore.jowRecipe,
					},
					{
						merge: true,
					}
				);
			}
			if (mealAfter?.jowRecipe) {
				batch.set(
					mostUsedRecipesRef.doc(mealAfter.jowRecipe._id),
					{
						count: FieldValue.increment(1),
						recipe: mealAfter.jowRecipe,
					},
					{
						merge: true,
					}
				);
			}
		}

		batch.commit().then(() => {
			if (mealAfter) {
				// The document has not been created or updated
				const searchKeys = generateMealSearchKeys(mealAfter);
				db.doc(change.after.ref.path).update({ searchKeys });
			}
		});
	};
}

function getMealCustomNames(meal: Meal): string[] {
	const primaryMealName = meal.name === meal.jowRecipe?.title ? undefined : meal.name;
	const secondaryMealName =
		meal.alternateDish?.name === meal.alternateDish?.jowRecipe?.title
			? undefined
			: meal.alternateDish?.name;
	return [primaryMealName, secondaryMealName]
		.map((name) => name?.trim() || undefined)
		.filter(isNotNullOrUndefined);
}

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
