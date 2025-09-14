import * as assert from 'assert';
import { onCall } from 'firebase-functions/v2/https';
import { assertAuthenticated } from './helpers/assert';
import { normalizeString } from './helpers/normalize-string';
import { db } from './init';
import { User } from './model/user.model';

export const search = onCall<{ term: string }>(async (request) => {
	const uid = request.auth?.uid;
	assertAuthenticated(uid);
	const inputTerm: string | undefined = request.data.term;
	console.log({ inputTerm });
	assert(
		inputTerm && inputTerm.length >= 2,
		'A search team is required and should be at least 2 characters'
	);

	const searchTerm: string = normalizeString(inputTerm);

	const userDoc = await db.doc(`users/${uid}`).get();
	const { familyName, isAllowedInFamily } = userDoc.data() as User;
	const mealsPath =
		familyName && isAllowedInFamily ? `families/${familyName}/meals` : `users/${uid}/meals`;

	console.log({ familyName, isAllowedInFamily, mealsPath, searchTerms: searchTerm.split(' ') });

	const searchQuery = db
		.collection(mealsPath)
		.where('searchKeys', 'array-contains-any', searchTerm?.split(' '));
	const searchSnap = await searchQuery.get();
	return searchSnap.docs.map((doc) => doc.data());
});
