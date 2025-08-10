import assert = require('assert');
import { https } from 'firebase-functions/v2';

export function assertAuthenticated(uid: string | undefined): asserts uid is string {
	assert(uid, new https.HttpsError('failed-precondition', 'not_authenticated'));
}

export function assertIsNotNullOrUndefined<T>(value: T): asserts value is NonNullable<T> {
	if (value === null || value === undefined) {
		throw new Error(`Expected "${value}" to be non-nullable`);
	}
}
