import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { GoogleApiState, GoogleApiStore } from './google-api.store';

@Injectable({ providedIn: 'root' })
export class GoogleApiQuery extends Query<GoogleApiState> {
	constructor(protected store: GoogleApiStore) {
		super(store);
	}
}
