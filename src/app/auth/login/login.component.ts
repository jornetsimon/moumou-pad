import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../auth.service';

@Component({
	selector: 'cb-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
	constructor(
		private router: Router,
		private angularFireAuth: Auth,
		private toastService: HotToastService,
		private authService: AuthService
	) {}

	login() {
		this.authService.login().subscribe(({ user }) => {
			if (user) {
				this.toastService.success(`Connecté en tant que ${user.displayName}`, {
					duration: 3000,
				});
				this.router.navigateByUrl('/');
			}
		});
	}
}
