import assert = require('assert');
import * as functions from 'firebase-functions';

export function assertAuthenticated(uid: string | undefined): asserts uid is string {
	assert(uid, new functions.https.HttpsError('failed-precondition', 'not_authenticated'));
}
