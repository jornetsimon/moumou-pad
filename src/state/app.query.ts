import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AppState, AppStore } from './app.store';
import { UserConfig } from '../app/model/user-config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AppQuery extends Query<AppState> {
	constructor(protected store: AppStore) {
		super(store);
	}

	userConfig$: Observable<UserConfig | undefined> = this.select().pipe(
		map((state) => state.userData?.config)
	);
}
