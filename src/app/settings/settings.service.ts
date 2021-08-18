import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AppQuery } from '../../state/app.query';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Family } from '../model/family';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	constructor(
		private afs: AngularFirestore,
		private appQuery: AppQuery,
		private fns: AngularFireFunctions
	) {}

	family$ = this.appQuery.select().pipe(
		switchMap((state) => {
			if (!state.user) {
				return of(undefined);
			}
			return this.afs.doc<Family>(`families/${state.userData?.familyName}`).valueChanges();
		})
	);

	approveOrDenyNewMember(familyName: string, memberUid: string, action: 'approve' | 'deny') {
		const callable = this.fns.httpsCallable('approveOrDenyNewFamilyMember');
		return callable({ memberUid, action });
	}
}
