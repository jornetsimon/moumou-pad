import { Client, isFullPage, LogLevel } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { firestore } from 'firebase-admin';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { assertIsNotNullOrUndefined } from './helpers/assert';
import { db } from './init';
import { MealIdea, NotionIdeasRequest, NotionIdeasResponse } from './model/meal-idea.model';
import { User } from './model/user.model';

// In v2, use environment variables (dotenv) and/or secrets
// Docs: https://firebase.google.com/docs/functions/config-env?gen=2nd#migrate-to-dotenv
export const notionIdeas = onCall<NotionIdeasRequest>(
	async (request): Promise<NotionIdeasResponse> => {
		const uid = request.auth?.uid;
		if (!uid) {
			throw new HttpsError('failed-precondition', 'not_authenticated');
		}

		const {
			start_cursor: startCursor,
			page_size: pageSize = 10,
			search_term: searchTerm,
		} = request.data ?? {};

		const userDoc = db.doc(`users/${uid}`) as firestore.DocumentReference<User>;
		const userSnapshot = await userDoc.get();
		const user = userSnapshot.data();

		// Prefer per-user Notion config, fallback to env/dotenv for emulator/local
		const integrationSecret =
			user?.notion?.integration_secret || process.env.NOTION_INTEGRATION_SECRET || '';
		const databaseId = user?.notion?.database_id || process.env.NOTION_DATABASE_ID || '';

		if (!integrationSecret || !databaseId) {
			return { ideas: [], has_more: false, next_cursor: null };
		}

		const isEmulated = process.env.FUNCTIONS_EMULATOR === 'true';
		const notion = new Client({
			auth: integrationSecret,
			logLevel: isEmulated ? LogLevel.DEBUG : LogLevel.WARN,
		});

		const nameNotEmpty = {
			property: 'Nom' as const,
			rich_text: { is_not_empty: true as const },
		};
		const searchFilter = {
			and: [
				nameNotEmpty,
				{
					property: 'Nom' as const,
					rich_text: { contains: searchTerm ?? '' },
				},
			],
		};
		const filter = searchTerm ? searchFilter : nameNotEmpty;

		const res = await notion.databases.query({
			database_id: databaseId,
			filter,
			page_size: pageSize,
			...(startCursor ? { start_cursor: startCursor } : {}),
		});

		const fullPages = res.results.filter(isFullPage);
		const ideas = fullPages.map((page) => extractMealIdeaFromNotionPage(page));

		return {
			ideas,
			has_more: res.has_more,
			next_cursor: res.next_cursor ?? null,
		};
	}
);

function extractMealIdeaFromNotionPage(page: PageObjectResponse): MealIdea {
	const nameProp = page.properties.Nom?.type === 'title' ? page.properties.Nom : null;
	const name = nameProp?.title[0].plain_text ?? null;

	const imageProp = page.properties.Image?.type === 'files' ? page.properties.Image : null;
	const image = imageProp?.files[0]?.type === 'file' ? imageProp.files[0].file.url : undefined;

	const tagsProp = page.properties.Tags?.type === 'multi_select' ? page.properties.Tags : null;
	const tags =
		tagsProp?.multi_select.map(({ name, color }) => ({
			name,
			color,
		})) ?? [];

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
