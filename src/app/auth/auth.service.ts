import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithCredential, UserCredential } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GoogleApiService } from '../shared/google-api';

declare const gapi: any;

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(private angularFireAuth: Auth, private googleApiService: GoogleApiService) {}

	login(): Observable<UserCredential> {
		return this.googleApiService.authInstance$.pipe(
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
