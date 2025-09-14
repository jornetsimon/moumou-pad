import { DocumentData, FirestoreDataConverter, WithFieldValue } from '@firebase/firestore';

export function getFirestoreConverter<
	AppModelType extends DocumentData,
>(): FirestoreDataConverter<AppModelType, AppModelType> {
	return {
		fromFirestore: (snapshot) => snapshot.data() as AppModelType,
		toFirestore: (model: WithFieldValue<AppModelType>): WithFieldValue<AppModelType> => model,
	};
}
