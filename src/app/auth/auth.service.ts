import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithCredential, UserCredential } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

declare const gapi: any;

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(private angularFireAuth: Auth) {
		gapi.load('client', () => {
			gapi.client.init({
				apiKey: environment.firebaseConfig.apiKey,
				clientId: environment.GAPI_CLIENT_ID,
				scope: 'https://www.googleapis.com/auth/calendar.readonly \
                  https://www.googleapis.com/auth/calendar.events.readonly',
				plugin_name: 'moumou-pad',
			});
		});
	}

	login(): Observable<UserCredential> {
		return from(gapi.auth2.getAuthInstance()).pipe(
			switchMap((googleAuth: any) => googleAuth.signIn()),
			switchMap((googleUser: any) => {
				const token = googleUser.getAuthResponse().id_token;
				const credential = GoogleAuthProvider.credential(token);
				return signInWithCredential(this.angularFireAuth, credential);
			})
		);
	}

	logout() {
		return from(this.angularFireAuth.signOut());
	}
}
