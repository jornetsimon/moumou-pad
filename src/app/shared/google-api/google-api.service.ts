import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare const google: any;

const ACCESS_TOKEN_DB_KEY = 'google_api_access_token';

@Injectable()
export class GoogleApiService {
	constructor(private storage: StorageMap) {}

	readonly token_client = google.accounts.oauth2.initTokenClient({
		client_id: environment.googleClientId,
		scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly',
		callback: (response: any) => {
			if (!response.access_token) {
				this.setAccessToken(undefined);
			}
			this.setAccessToken(response.access_token);
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

	static toDate<T extends string | undefined>(value: T): T extends string ? Date : undefined {
		if (value) {
			// @ts-ignore
			return new Date(value);
		}
		// @ts-ignore
		return undefined;
	}
}
