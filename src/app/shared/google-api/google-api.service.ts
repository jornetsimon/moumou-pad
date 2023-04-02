import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
	catchError,
	distinctUntilChanged,
	first,
	shareReplay,
	switchMap,
	tap,
} from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare const gapi: any;
declare const google: any;

@Injectable({
	providedIn: 'root',
})
export class GoogleApiService {
	constructor(private storage: StorageMap) {}

	readonly token_client: any = google.accounts.oauth2.initTokenClient({
		client_id: environment.googleClientId,
		scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly',
		callback: (response: any) => {
			console.log('initTokenClient response', response);
			if (!response.access_token) {
				this.setAccessToken(undefined);
			}
			this.setAccessToken(response.access_token);
			this.gapiClientLoaded$$.next(true);
		},
	});

	readonly accessToken$ = this.storage
		.watch<string | undefined>(ACCESS_TOKEN_DB_KEY, { type: 'string' })
		.pipe(
			catchError(() => of(undefined)),
			distinctUntilChanged()
		);

	setAccessToken(token: string | undefined) {
		this.storage.set(ACCESS_TOKEN_DB_KEY, token).subscribe();
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
	readonly waitForGapi$ = combineLatest([
		this.waitForGapiClient$ /*, this.waitForGapiAuth$*/,
	]).pipe(first());

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

const ACCESS_TOKEN_DB_KEY = 'google_api_access_token';
