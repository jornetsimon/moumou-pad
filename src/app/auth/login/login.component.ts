import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthService } from '../auth.service';
import { accounts } from 'google-one-tap';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

declare const google: any;

@UntilDestroy()
@Component({
	selector: 'cb-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit {
	constructor(
		private router: Router,
		private toastService: HotToastService,
		private authService: AuthService,
		private ngZone: NgZone
	) {}

	@ViewChild('googleSignInButton') googleSignInButton?: ElementRef<HTMLElement>;

	ngAfterViewInit() {
		const gAccounts: accounts = google.accounts;

		gAccounts.id.initialize({
			client_id: environment.googleClientId,
			ux_mode: 'popup',
			cancel_on_tap_outside: true,
			callback: ({ credential }) => {
				this.ngZone.run(() => {
					this.login(credential);
				});
			},
		});

		if (this.googleSignInButton)
			gAccounts.id.renderButton(this.googleSignInButton.nativeElement, {
				theme: 'filled_blue',
				shape: 'pill',
				type: 'standard',
				locale: 'fr',
				size: 'large',
				text: 'signin',
			});
	}

	login(token: string) {
		this.authService
			.signInWithGoogle(token)
			.pipe(
				tap(({ user }) => {
					if (user) {
						this.toastService.success(`Connecté en tant que ${user.displayName}`, {
							duration: 3000,
						});
						this.router.navigateByUrl('/');
					}
				}),
				untilDestroyed(this)
			)
			.subscribe();
	}
}
