import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { HotToastService } from '@ngneat/hot-toast';

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
		this.angularFireAuth
			.signInWithPopup(new firebase.auth.GoogleAuthProvider())
			.then((credential) => {
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
