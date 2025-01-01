import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Order, QueryConfig, QueryEntity } from '@datorama/akita';
import { AppQuery } from '../../state/app.query';
import { SuggestionState, SuggestionStore } from './suggestion-store.service';

@QueryConfig({ sortBy: 'date', sortByOrder: Order.ASC })
@Injectable({ providedIn: 'root' })
export class SuggestionQuery extends QueryEntity<SuggestionState> {
	constructor(
		protected store: SuggestionStore,
		protected firestore: Firestore,
		private appQuery: AppQuery
	) {
		super(store);
	}
}
