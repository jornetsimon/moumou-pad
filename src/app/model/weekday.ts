import { timer } from 'rxjs';
import { GLOBAL_CONFIG } from '../../global-config';
import { map, shareReplay } from 'rxjs/operators';

export const weekdays: Record<string, number> = {
	lundi: 0,
	mardi: 1,
	mercredi: 2,
	jeudi: 3,
	vendredi: 4,
	samedi: 5,
	dimanche: 6,
};
const updateTimeIntervalInMilliseconds = GLOBAL_CONFIG.nowUpdateIntervalInMinutes * 60 * 1000;
export const now$ = timer(0, updateTimeIntervalInMilliseconds).pipe(
	map(() => new Date()),
	shareReplay(1)
);
