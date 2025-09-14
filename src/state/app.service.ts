import { Injectable } from '@angular/core';
import { doc, docData, Firestore, updateDoc } from '@angular/fire/firestore';
import { UpdateData } from '@firebase/firestore';
import { UntilDestroy } from '@ngneat/until-destroy';
import { addWeeks, isBefore } from 'date-fns/esm';
import { tap } from 'rxjs/operators';
import { UserConfig } from '../app/model/user-config';
import { UserData } from '../app/model/user-data';
import { getFirestoreConverter } from '../utils/firestore-converter';
import { AppStore } from './app.store';

export type ShiftDirection = 'previous' | 'next';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class AppService {
	constructor(
		private appStore: AppStore,
		private firestore: Firestore
	) {}

	fetchConfig(uid: string) {
		return docData(
			doc(this.firestore, `/users/${uid}`).withConverter(getFirestoreConverter<UserData>())
		).pipe(tap((userData) => this.appStore.update({ userData })));
	}

	setConfig(config: UpdateData<UserConfig>) {
		const uid = this.appStore.getValue().user!.uid;
		const userDoc = doc(this.firestore, `/users/${uid}`).withConverter(
			getFirestoreConverter<UserData>()
		);
		return updateDoc(userDoc, { config });
	}

	shiftSchedule(direction: ShiftDirection) {
		this.appStore.update((state) => {
			const { from, to } = state.schedule;
			const shift = direction === 'next' ? 1 : -1;
			const newFromDate = addWeeks(from, shift);
			const newToDate = addWeeks(to, shift);

			let syncFromDate = state.syncFromDate;
			if (isBefore(newFromDate, state.syncFromDate)) {
				console.log(`Broadening the past loaded meals to ${newFromDate}`);
				syncFromDate = newFromDate;
			}

			return {
				...state,
				schedule: {
					from: newFromDate,
					to: newToDate,
				},
				syncFromDate,
			};
		});
	}

	resetSchedule() {
		this.appStore.setInitialSchedule();
	}
}
