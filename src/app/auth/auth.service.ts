import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithCredential, UserCredential } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(private angularFireAuth: Auth) {}

	signInWithGoogle(token: string): Observable<UserCredential> {
		const credential = GoogleAuthProvider.credential(token);
		return from(signInWithCredential(this.angularFireAuth, credential));
	}

	logout() {
		return from(this.angularFireAuth.signOut());
	}
}
