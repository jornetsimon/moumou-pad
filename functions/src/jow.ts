import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as request from 'request';

const baseUrl = 'https://api.jow.fr/public';

export const featured = onCall(() => {
	return new Promise((resolve, reject) => {
		// eslint-disable-next-line import/namespace
		request.get(
			{
				url: `${baseUrl}/recipes/featured`,
				json: true,
				headers: { 'User-Agent': 'request' },
			},
			(err, res, data) => {
				if (err instanceof Error) {
					reject(err);
				} else if (res.statusCode !== 200) {
					reject(new Error(`Status code : ${res.statusCode}`));
				} else {
					resolve(data);
				}
			}
		);
	});
});

export const search = onCall<{ term: string }>((req) => {
	const searchTerm: string = req.data.term;
	return new Promise((resolve, reject) => {
		// eslint-disable-next-line import/namespace
		request.post(
			{
				url: `${baseUrl}/recipe/quicksearch?query=${encodeURIComponent(
					searchTerm
				)}&limit=5`,
				json: true,
				headers: { 'User-Agent': 'request' },
			},
			(err, res, data) => {
				if (err instanceof Error) {
					reject(err);
				} else if (res.statusCode !== 200) {
					reject(new Error(`Status code : ${res.statusCode}`));
				} else {
					resolve(data);
				}
			}
		);
	});
});

export const get = onCall<{ id: string }>((req) => {
	const id = req.data.id;
	if (!id) {
		throw new HttpsError('invalid-argument', 'missing_recipe_id');
	}
	return new Promise((resolve, reject) => {
		// eslint-disable-next-line import/namespace
		request.get(
			{
				url: `${baseUrl}/recipe/${id}`,
				json: true,
				headers: { 'User-Agent': 'request' },
			},
			(err, res, data) => {
				if (err instanceof Error) {
					reject(err);
				} else if (res.statusCode !== 200) {
					reject(new Error(`Status code : ${res.statusCode}`));
				} else {
					resolve(data);
				}
			}
		);
	});
});
