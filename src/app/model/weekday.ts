import { timer } from 'rxjs';
import { GLOBAL_CONFIG } from '../../global-config';
import { map, shareReplay } from 'rxjs/operators';

const updateTimeIntervalInMilliseconds = GLOBAL_CONFIG.nowUpdateIntervalInMinutes * 60 * 1000;
export const now$ = timer(0, updateTimeIntervalInMilliseconds).pipe(
	map(() => new Date()),
	shareReplay(1)
);
