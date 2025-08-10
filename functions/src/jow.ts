import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as request from 'request';

const baseUrl = 'https://api.jow.fr/public';

export const featured = onCall(() => {
	return new Promise((resolve, reject) => {
		request.get(
			{
				url: `${baseUrl}/recipes/featured`,
				json: true,
				headers: { 'User-Agent': 'request' },
			},
			(err, res, data) => {
				if (err) {
					reject(err);
				} else if (res.statusCode !== 200) {
					reject(`Status code : ${res.statusCode}`);
				} else {
					resolve(data);
				}
			}
		);
	});
});

export const search = onCall((req) => {
	const searchTerm: string = req.data.term;
	return new Promise((resolve, reject) => {
		request.post(
			{
				url: `${baseUrl}/recipe/quicksearch?query=${encodeURIComponent(
					searchTerm
				)}&limit=5`,
				json: true,
				headers: { 'User-Agent': 'request' },
			},
			(err, res, data) => {
				if (err) {
					reject(err);
				} else if (res.statusCode !== 200) {
					reject(`Status code : ${res.statusCode}`);
				} else {
					resolve(data);
				}
			}
		);
	});
});

export const get = onCall((req) => {
	const id: string = req.data.id;
	if (!id) {
		throw new HttpsError('invalid-argument', 'missing_recipe_id');
	}
	return new Promise((resolve, reject) => {
		request.get(
			{
				url: `${baseUrl}/recipe/${id}`,
				json: true,
				headers: { 'User-Agent': 'request' },
			},
			(err, res, data) => {
				if (err) {
					reject(err);
				} else if (res.statusCode !== 200) {
					reject(`Status code : ${res.statusCode}`);
				} else {
					resolve(data);
				}
			}
		);
	});
});
