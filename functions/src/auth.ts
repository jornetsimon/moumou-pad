import * as functions from 'firebase-functions';
import { db } from './init';

export const createUser = functions.auth.user().onCreate((user) => {
	return db.doc(`/users/${user.uid}`).create({ config: { startWeekOn: 0 } });
});
