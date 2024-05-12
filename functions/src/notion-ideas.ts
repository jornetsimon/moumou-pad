import * as functions from 'firebase-functions';
import { Client, isFullPage } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { MealIdea } from './model/meal-idea.model';
import { assertIsNotNullOrUndefined } from './helpers/assert';

const config = functions.config();

export const notionIdeas = functions.region('europe-west1').https.onCall(async (data, context) => {
	const notion = new Client({
		auth: config.notion.key,
	});

	const res = await notion.databases.query({
		database_id: '9221c1d7570d460f97430a5eddafbaff',
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
	const tags = tagsProp?.multi_select.map((select) => select.name) ?? [];

	assertIsNotNullOrUndefined(name);

	return {
		name,
		image,
		tags,
	};
}
