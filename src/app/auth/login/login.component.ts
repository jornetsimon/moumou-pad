import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { UntilDestroy } from '@ngneat/until-destroy';
import { HotToastService } from '@ngneat/hot-toast';

@UntilDestroy()
@Component({
	selector: 'cb-login',
	standalone: true,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.less'],
})
export class LoginComponent {
	constructor(
		private router: Router,
		private angularFireAuth: Auth,
		private toastService: HotToastService
	) {}

	login() {
		const authProvider = new GoogleAuthProvider();
		signInWithPopup(this.angularFireAuth, authProvider).then((credential) => {
			if (credential.user) {
				this.toastService.success(`Connecté en tant que ${credential.user.displayName}`, {
					duration: 3000,
				});
				this.router.navigateByUrl('/');
			}
		});
	}
}
