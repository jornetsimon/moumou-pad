import * as functions from 'firebase-functions';
import { db } from './init';
import { firestore } from 'firebase-admin';
import FieldValue = firestore.FieldValue;

export const joinFamily = functions.region('europe-west1').https.onCall(async (data, context) => {
	const uid = context.auth?.uid;
	if (!uid) {
		throw new functions.https.HttpsError('failed-precondition', 'not_authenticated');
	}
	const familyName = data.name.toLowerCase();
	const familyRef = db.collection('families').doc(familyName);
	const familySnap = await familyRef.get();

	const userData: { familyName: string; isAllowedInFamily: boolean } = {
		familyName,
		isAllowedInFamily: false,
	};
	// TODO: should be a transaction
	if (familySnap.exists && familySnap.data()?.members?.length > 0) {
		await familyRef.update({ pending: FieldValue.arrayUnion(uid) });
	} else {
		// The user will be the family manager
		userData.isAllowedInFamily = true;
		await familyRef.set({ members: [uid], manager: uid });
	}
	await db.collection('users').doc(uid).update(userData);
});

export const approveOrDenyNewFamilyMember = functions
	.region('europe-west1')
	.https.onCall(async (data, context) => {
		const uid = context.auth?.uid;
		if (!uid) {
			throw new functions.https.HttpsError('failed-precondition', 'not_authenticated');
		}
		const userRef = db.collection('users').doc(uid);
		const user = (await userRef.get()).data();
		const familyRef = db.collection('families').doc(user?.familyName);
		const family = (await familyRef.get()).data();
		if (family?.manager !== uid) {
			throw new functions.https.HttpsError(
				'failed-precondition',
				'user_is_not_family_manager'
			);
		}
		const memberUid: string = data.memberUid;
		const newMemberRef = db.collection('users').doc(memberUid);
		const action: 'approve' | 'deny' = data.action;

		if (action === 'approve') {
			await familyRef.update({
				pending: FieldValue.arrayRemove(memberUid),
				members: FieldValue.arrayUnion(memberUid),
			});

			await newMemberRef.update({
				isAllowedInFamily: true,
			});
			return;
		} else {
			await familyRef.update({ pending: FieldValue.arrayRemove(memberUid) });
			await newMemberRef.update({
				familyName: null,
			});
		}
	});
