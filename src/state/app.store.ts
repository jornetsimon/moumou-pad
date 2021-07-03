import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import firebase from 'firebase';
import { UserData } from '../app/model/user-data';

export interface AppState {
	user?: firebase.User;
	userData?: UserData;
}

export function createInitialState(): AppState {
	return {};
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'app' })
export class AppStore extends Store<AppState> {
	constructor() {
		super(createInitialState());
	}
}
