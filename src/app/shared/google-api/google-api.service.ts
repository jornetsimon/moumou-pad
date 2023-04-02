import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { first, shareReplay, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare const gapi: any;

@Injectable({
	providedIn: 'root',
})
export class GoogleApiService {
	constructor() {
		gapi.load('client', () => {
			gapi.client.init({
				apiKey: environment.firebaseConfig.apiKey,
				clientId: environment.googleClientId,
				discoveryDocs: ['https://calendar.googleapis.com/$discovery/rest'],
				scope: 'https://www.googleapis.com/auth/calendar.readonly \
                  https://www.googleapis.com/auth/calendar.events.readonly',
				plugin_name: 'moumou-pad',
			});
			this.gapiClientLoaded$$.next(true);
		});
	}

	private readonly gapiClientLoaded$$ = new BehaviorSubject(false);
	readonly waitForGapiClient$ = this.gapiClientLoaded$$.pipe(
		first(Boolean),
		shareReplay({ refCount: true, bufferSize: 1 })
	);
	readonly waitForGapiAuth$ = this.waitForGapiClient$.pipe(
		switchMap(() => gapi.auth2.getAuthInstance()),
		first(),
		shareReplay({ refCount: true, bufferSize: 1 })
	);
	readonly waitForGapi$ = combineLatest([this.waitForGapiClient$, this.waitForGapiAuth$]).pipe(
		first()
	);

	readonly authInstance$: Observable<any> = this.waitForGapiClient$.pipe(
		switchMap(() => gapi.auth2.getAuthInstance()),
		tap((_) => console.log(_)),
		shareReplay({ refCount: true, bufferSize: 1 })
	);

	static toDate<T extends string | undefined>(value: T): T extends string ? Date : undefined {
		if (value) {
			// @ts-ignore
			return new Date(value);
		}
		// @ts-ignore
		return undefined;
	}
}
