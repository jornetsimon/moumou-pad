import { FieldValue } from 'firebase-admin/firestore';
import { ParamsOf } from 'firebase-functions';
import {
	Change,
	DocumentSnapshot,
	FirestoreEvent,
	onDocumentWritten,
} from 'firebase-functions/v2/firestore';
import slugify from 'slugify';
import { isNotNullOrUndefined } from './helpers/is-not-null-or-undefined.helper';
import { normalizeString } from './helpers/normalize-string';
import { PickByType } from './helpers/pick-by-type';
import { RecursiveKeyOf } from './helpers/recursive-key-of';
import { db } from './init';
import { Meal } from './model/meal.model';
import { Recipe } from './model/receipe.model';
import get = require('lodash/get');
import uniq = require('lodash/uniq');

export const createMeal = onDocumentWritten('users/{targetId}/meals/{mealId}', (event) =>
	onMealCreated('users')(event)
);

export const createFamilyMeal = onDocumentWritten('families/{targetId}/meals/{mealId}', (event) => {
	return onMealCreated('families')(event);
});

export function onMealCreated<Document extends string>(targetLocation: 'users' | 'families') {
	return (
		event: FirestoreEvent<Change<DocumentSnapshot> | undefined, ParamsOf<Document>>
	): void => {
		const change = event.data;
		const params = event.params;

		const mostUsedRef = db.collection(`${targetLocation}/${params.targetId}/most-used`);
		const mostUsedRecipesRef = db.collection(
			`${targetLocation}/${params.targetId}/most-used-recipes`
		);
		const mealBefore = change?.before?.exists ? (change.before.data() as Meal) : undefined;
		const mealAfter = change?.after?.exists ? (change.after.data() as Meal) : undefined;
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
			if (mealAfter && change) {
				// The document has not been created or updated
				const searchKeys = generateMealSearchKeys(mealAfter);
				db.doc(change.after.ref.path).update({ searchKeys });
			}
		});
	};
}

function getMealCustomNames(meal: Meal): string[] {
	const primaryMealName = meal.name === meal.jowRecipe?.title ? undefined : meal.name;
	return [primaryMealName].map((name) => name?.trim() || undefined).filter(isNotNullOrUndefined);
}

function generateMealSearchKeys(meal: Meal): Meal['searchKeys'] {
	const keys: Array<AllowedSearchKey> = [
		'name',
		'recipeMemo',
		'jowRecipe.title',
		'jowRecipe.composition',
		'jowRecipe.keywords',
	];
	const values: string[] = keys
		.map((key) => get(meal, key))
		.filter((val): val is string => !!val && typeof val === 'string');

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
	| `jowRecipe.${RecursiveKeyOf<Recipe, string>}`;
