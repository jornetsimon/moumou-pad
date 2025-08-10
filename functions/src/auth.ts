import functions = require('firebase-functions/v1');
import { db } from './init';

// Note: Firebase Functions v2 does not support Auth triggers.
// This function must remain on v1 to work with Firebase Authentication events.
export const createUser = functions.auth.user().onCreate((user) => {
	return db.doc(`/users/${user.uid}`).create({ config: { startWeekOn: 0 } });
});
