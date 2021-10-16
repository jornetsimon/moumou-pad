import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import firebase from 'firebase';
import { UserData } from '../app/model/user-data';
import { GLOBAL_CONFIG } from '../global-config';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { generateSchedule } from '../app/model/period';
import { interval } from 'rxjs';
import { ProgrammeWithDuration } from '../app/model/tv.model';
import { programsWithDuration, TvService } from '../app/tv/tv.service';
import { tap } from 'rxjs/operators';

export interface AppState {
	user?: firebase.User;
	userData?: UserData;
	schedule: {
		from: Date;
		to: Date;
	};
	tvPrograms?: {
		primeTime?: ProgrammeWithDuration[];
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
	constructor(private tvService: TvService) {
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

	fetchPrimeTimePrograms() {
		return this.tvService
			.getPrimeTimeProgram()
			.pipe(
				programsWithDuration,
				tap({ next: (programs) => this.update({ tvPrograms: { primeTime: programs } }) })
			);
	}
}
