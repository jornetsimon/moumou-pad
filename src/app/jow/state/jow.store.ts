import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Recipe } from '../../model/receipe';

export interface JowState {
	featured: Array<Recipe>;
}

export function createInitialState(): JowState {
	return {
		featured: [],
	};
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'jow' })
export class JowStore extends Store<JowState> {
	constructor() {
		super(createInitialState());
	}
}
