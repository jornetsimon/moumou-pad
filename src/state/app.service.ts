import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AppStore } from './app.store';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserData } from '../app/model/user-data';
import { UserConfig } from '../app/model/user-config';

@Injectable({ providedIn: 'root' })
export class AppService {
	constructor(private appStore: AppStore, private angularFirestore: AngularFirestore) {}

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
}
