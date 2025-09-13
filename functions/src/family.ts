import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { getFirestoreConverter } from './helpers/firestore-converter';
import { db } from './init';
import { Family } from './model/family.model';

const familyConverter = getFirestoreConverter<Family>();

export const joinFamily = onCall<{ name: string }>(async (request) => {
	const uid = request.auth?.uid;
	if (!uid) {
		throw new HttpsError('failed-precondition', 'not_authenticated');
	}
	const familyName = request.data.name.toLowerCase();
	const familyRef = db.collection('families').withConverter(familyConverter).doc(familyName);
	const familySnap = await familyRef.get();

	const userData: { familyName: string; isAllowedInFamily: boolean } = {
		familyName,
		isAllowedInFamily: false,
	};
	// TODO: should be a transaction
	if (familySnap.exists && (familySnap.data() as Family).members.length > 0) {
		await familyRef.update({ pending: FieldValue.arrayUnion(uid) });
	} else {
		// The user will be the family manager
		userData.isAllowedInFamily = true;
		await familyRef.set({ members: [uid], pending: [], manager: uid });
	}
	await db.collection('users').doc(uid).update(userData);
});

export const approveOrDenyNewFamilyMember = onCall<{
	memberUid: string;
	action: 'approve' | 'deny';
}>(async (request) => {
	const uid = request.auth?.uid;
	if (!uid) {
		throw new HttpsError('failed-precondition', 'not_authenticated');
	}
	const userRef = db.collection('users').doc(uid);
	const user = (await userRef.get()).data() as { familyName?: string } | undefined;
	const familyName = user?.familyName;
	if (!familyName) {
		throw new HttpsError('failed-precondition', 'user_has_no_family');
	}
	const familyRef = db.collection('families').withConverter(familyConverter).doc(familyName);

	const family = (await familyRef.get()).data();
	if (family?.manager !== uid) {
		throw new HttpsError('failed-precondition', 'user_is_not_family_manager');
	}
	const memberUid: string = request.data.memberUid;
	const newMemberRef = db.collection('users').doc(memberUid);
	const action: 'approve' | 'deny' = request.data.action;

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
