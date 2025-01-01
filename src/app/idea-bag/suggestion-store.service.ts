import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Suggestion } from './suggestion.model';

export interface SuggestionState extends EntityState<Suggestion> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'suggestions', resettable: true })
export class SuggestionStore extends EntityStore<SuggestionState> {
	constructor() {
		super();
	}
}
