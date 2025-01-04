import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserConfig } from '../app/model/user-config';
import { AppState, AppStore } from './app.store';

@Injectable({ providedIn: 'root' })
export class AppQuery extends Query<AppState> {
	constructor(protected store: AppStore) {
		super(store);
	}

	readonly user$ = this.select('user');
	readonly userData$ = this.select('userData');

	readonly userConfig$: Observable<UserConfig | undefined> = this.select().pipe(
		map((state) => state.userData?.config)
	);

	readonly targetPath$ = this.select().pipe(map(AppQuery.extractTargetPath));

	readonly hasFamily$ = this.userData$.pipe(
		map((userData) => !!userData?.familyName && userData.isAllowedInFamily)
	);

	getTargetPath(): string {
		return AppQuery.extractTargetPath(this.getValue());
	}

	private static extractTargetPath(stateSnapshot: AppState) {
		const userData = stateSnapshot.userData;
		const familyName = userData?.familyName;
		const isAllowedInFamily = userData?.isAllowedInFamily;
		const userId = stateSnapshot.user!.uid;

		if (familyName && isAllowedInFamily) {
			return `families/${familyName}`;
		}
		return `users/${userId}`;
	}
}
