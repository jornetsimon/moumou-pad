import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

declare const gapi: any;

@Injectable({
	providedIn: 'root',
})
export class GoogleApiService {
	constructor() {}

	static toDate<T extends string | undefined>(value: T): T extends string ? Date : undefined {
		if (value) {
			// @ts-ignore
			return new Date(value);
		}
		// @ts-ignore
		return undefined;
	}

	readonly googleApiToken$ = from(gapi.auth2.getAuthInstance()).pipe(
		map((authInstance: any) => {
			const user = authInstance.currentUser.get();
			const authResponse = user.getAuthResponse();
			const accessToken: string = authResponse.access_token;
			console.log({ authInstance, user, authResponse, accessToken });
			return accessToken;
		})
	);
}
