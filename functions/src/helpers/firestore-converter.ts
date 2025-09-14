import { FirestoreDataConverter } from 'firebase-admin/firestore';

export function getFirestoreConverter<
	AppModelType extends FirebaseFirestore.DocumentData,
>(): FirestoreDataConverter<AppModelType, AppModelType> {
	return {
		fromFirestore: (snapshot) => snapshot.data() as AppModelType,
		toFirestore: (
			model: FirebaseFirestore.WithFieldValue<AppModelType>
		): FirebaseFirestore.WithFieldValue<AppModelType> => model,
	};
}
