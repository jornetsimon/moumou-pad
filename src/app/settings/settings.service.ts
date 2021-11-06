import { Injectable } from '@angular/core';
import { AppQuery } from '../../state/app.query';
import { switchMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { DocumentReference } from 'rxfire/firestore/interfaces';
import { Family } from '../model/family';

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	constructor(private firestore: Firestore, private appQuery: AppQuery, private fns: Functions) {}

	family$: Observable<Family | undefined> = this.appQuery.select().pipe(
		switchMap((state) => {
			if (!state.user) {
				return of(undefined);
			}
			return docData(
				doc(
					this.firestore,
					`families/${state.userData?.familyName}`
				) as DocumentReference<Family>
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
