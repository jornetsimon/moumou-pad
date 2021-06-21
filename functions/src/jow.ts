import * as functions from 'firebase-functions';
import * as request from 'request';

const baseUrl = 'https://api.jow.fr/public';

export const featured = functions.region('europe-west1').https.onCall(() => {
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
export const search = functions.region('europe-west1').https.onCall((data) => {
	const searchTerm: string = data.term;
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
export const get = functions.region('europe-west1').https.onCall((data) => {
	const id: string = data.id;
	if (!id) {
		throw new functions.https.HttpsError('invalid-argument', 'missing_recipe_id');
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
