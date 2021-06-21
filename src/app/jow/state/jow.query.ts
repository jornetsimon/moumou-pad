import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { JowState, JowStore } from './jow.store';

@Injectable({ providedIn: 'root' })
export class JowQuery extends Query<JowState> {
	constructor(protected store: JowStore) {
		super(store);
	}
}
