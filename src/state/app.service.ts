import { Injectable } from '@angular/core';
import { filter, map, tap } from 'rxjs/operators';
import { AppStore } from './app.store';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserData } from '../app/model/user-data';
import { UserConfig } from '../app/model/user-config';
import { addWeeks } from 'date-fns/esm';
import { Observable } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

export type ShiftDirection = 'previous' | 'next';

@Injectable({ providedIn: 'root' })
export class AppService {
	constructor(
		private appStore: AppStore,
		private angularFirestore: AngularFirestore,
		private router: Router
	) {}

	currentUrl$: Observable<string> = this.router.events.pipe(
		filter((event): event is NavigationEnd => event instanceof NavigationEnd),
		map((event) => event.url)
	);
	isHome$ = this.currentUrl$.pipe(map((url) => url === '/'));

	fetchConfig(uid: string) {
		return this.angularFirestore
			.doc<UserData>(`/users/${uid}`)
			.valueChanges()
			.pipe(tap((userData) => this.appStore.update({ userData })));
	}

	setConfig(config: UserConfig) {
		const uid = this.appStore.getValue().user!.uid;
		const userDoc = this.angularFirestore.doc<UserData>(`/users/${uid}`);
		return userDoc.update({ config });
	}

	shiftSchedule(direction: ShiftDirection) {
		this.appStore.update((state) => {
			const { from, to } = state.schedule;
			const shift = direction === 'next' ? 1 : -1;
			return {
				...state,
				schedule: {
					from: addWeeks(from, shift),
					to: addWeeks(to, shift),
				},
			};
		});
	}

	resetSchedule() {
		this.appStore.setInitialSchedule();
	}
}
