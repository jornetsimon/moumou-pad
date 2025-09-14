import { Injectable } from '@angular/core';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppQuery } from '../../state/app.query';
import { getFirestoreConverter } from '../../utils/firestore-converter';
import { Family } from '../model/family';

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	constructor(
		private firestore: Firestore,
		private appQuery: AppQuery,
		private fns: Functions
	) {}

	readonly family$: Observable<Family | undefined> = this.appQuery.select().pipe(
		switchMap((state) => {
			if (!state.user || !state.userData?.familyName) {
				return of(undefined);
			}
			return docData(
				doc(this.firestore, `families/${state.userData.familyName}`).withConverter(
					getFirestoreConverter<Family>()
				)
			);
		})
	);

	approveOrDenyNewMember(familyName: string, memberUid: string, action: 'approve' | 'deny') {
		const callable = httpsCallable<{ memberUid: string; action: 'approve' | 'deny' }, void>(
			this.fns,
			'approveOrDenyNewFamilyMember'
		);
		return from(callable({ memberUid, action }));
	}
}
