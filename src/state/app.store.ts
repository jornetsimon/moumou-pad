import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { UserData } from '../app/model/user-data';
import { GLOBAL_CONFIG } from '../global-config';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { generateSchedule } from '../app/model/period';
import { interval } from 'rxjs';
import { User as FirebaseUser } from '@firebase/auth';

export interface AppState {
	user?: FirebaseUser;
	userData?: UserData;
	schedule: {
		from: Date;
		to: Date;
	};
}

export function createInitialState(): AppState {
	return {
		schedule: generateSchedule(),
	};
}

@UntilDestroy()
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'app' })
export class AppStore extends Store<AppState> {
	constructor() {
		super(createInitialState());

		const updateTimeIntervalInMilliseconds =
			GLOBAL_CONFIG.nowUpdateIntervalInMinutes * 60 * 1000;
		interval(updateTimeIntervalInMilliseconds)
			.pipe(untilDestroyed(this))
			.subscribe(() => {
				console.log('Updating the schedule');
				this.setInitialSchedule();
			});
	}

	setInitialSchedule() {
		this.update({ schedule: generateSchedule() });
	}
}
