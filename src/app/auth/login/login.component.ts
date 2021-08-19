import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { HotToastService } from '@ngneat/hot-toast';
import UserCredential = firebase.auth.UserCredential;

@Component({
	selector: 'cb-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
	constructor(
		private router: Router,
		private angularFireAuth: AngularFireAuth,
		private toastService: HotToastService
	) {}

	login() {
		const navigator: any = window.navigator;
		const authProvider = new firebase.auth.GoogleAuthProvider();
		if ('standalone' in navigator && navigator.standalone) {
			// Sign in with redirect on iOS installed PWA
			this.angularFireAuth.signInWithRedirect(authProvider).then(() => {
				this.toastService.success(`Connecté`, {
					duration: 3000,
				});
				this.router.navigateByUrl('/');
			});
		} else {
			this.angularFireAuth
				.signInWithPopup(authProvider)
				.then((credential: UserCredential) => {
					if (credential.user) {
						this.toastService.success(
							`Connecté en tant que ${credential.user.displayName}`,
							{
								duration: 3000,
							}
						);
						this.router.navigateByUrl('/');
					}
				});
		}
	}
}
