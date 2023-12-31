import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from '@angular/fire/auth';
import { UntilDestroy } from '@ngneat/until-destroy';
import { HotToastService } from '@ngneat/hot-toast';

@UntilDestroy()
@Component({
	selector: 'cb-login',
	standalone: true,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
	constructor(
		private router: Router,
		private angularFireAuth: Auth,
		private toastService: HotToastService
	) {}

	login() {
		const navigator: any = window.navigator;
		const authProvider = new GoogleAuthProvider();
		if ('standalone' in navigator && navigator.standalone) {
			// Sign in with redirect on iOS installed PWA
			signInWithRedirect(this.angularFireAuth, authProvider).then(() => {
				this.toastService.success(`Connecté`, {
					duration: 3000,
				});
				this.router.navigateByUrl('/');
			});
		} else {
			signInWithPopup(this.angularFireAuth, authProvider).then((credential) => {
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
