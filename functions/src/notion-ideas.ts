import * as functions from 'firebase-functions';
import { Client, isFullPage, LogLevel } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { MealIdea } from './model/meal-idea.model';
import { assertIsNotNullOrUndefined } from './helpers/assert';
import { db } from './init';
import { User } from './model/user.model';
import { firestore } from 'firebase-admin';

const config = functions.config();
const isEmulated = process.env.FUNCTIONS_EMULATOR === 'true';

export const notionIdeas = functions.region('europe-west1').https.onCall(async (data, context) => {
	const uid = context.auth?.uid;
	if (!uid) {
		throw new functions.https.HttpsError('failed-precondition', 'not_authenticated');
	}

	const userDoc = db.doc(`users/${uid}`) as firestore.DocumentReference<User>;
	const userSnapshot = await userDoc.get();
	const user = userSnapshot.data();
	const notionConfig: User['notion'] = isEmulated ? config.notion : user?.notion;

	if (!notionConfig) {
		return [];
	}

	const notion = new Client({
		auth: notionConfig?.integration_secret,
		logLevel: isEmulated ? LogLevel.DEBUG : LogLevel.WARN,
	});

	const res = await notion.databases.query({
		database_id: notionConfig?.database_id,
		filter: {
			property: 'Nom',
			rich_text: {
				is_not_empty: true,
			},
		},
	});

	const fullPages = res.results.filter(isFullPage);
	return fullPages.map((page) => extractMealIdeaFromNotionPage(page));
});

function extractMealIdeaFromNotionPage(page: PageObjectResponse): MealIdea {
	const nameProp = page.properties.Nom?.type === 'title' ? page.properties.Nom : null;
	const name = nameProp?.title[0].plain_text ?? null;

	const imageProp = page.properties.Image?.type === 'files' ? page.properties.Image : null;
	const image = imageProp?.files[0]?.type === 'file' ? imageProp.files[0].file.url : undefined;

	const tagsProp = page.properties.Tags?.type === 'multi_select' ? page.properties.Tags : null;
	const tags = tagsProp?.multi_select.map(({ name, color }) => ({ name, color })) ?? [];

	const ratingProp =
		page.properties['Appréciation']?.type === 'select' ? page.properties['Appréciation'] : null;
	const rawRating = ratingProp?.select?.name || '';
	const positiveRating = rawRating.split('👍').length - 1;
	const negativeRating = rawRating.split('👎').length - 1;
	const rating = positiveRating - negativeRating;

	const urlProp = page.properties.URL?.type === 'url' ? page.properties.URL : null;
	const url = urlProp?.url ?? undefined;

	assertIsNotNullOrUndefined(name);

	return {
		notionPageUrl: page.url,
		created_at: page.created_time,
		name,
		image,
		tags,
		url,
		rating,
	};
}
