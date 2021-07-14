import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AppStore } from '../state/app.store';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, switchMap } from 'rxjs/operators';
import { AppService } from '../state/app.service';

@UntilDestroy()
@Component({
	selector: 'cb-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	constructor(
		update: SwUpdate,
		private snackbar: MatSnackBar,
		public angularFireAuth: AngularFireAuth,
		private router: Router,
		private appStore: AppStore,
		private appService: AppService
	) {
		update.available.subscribe((upd: any) => {
			const snack = snackbar.open('Une mise à jour est disponible', `C'est parti !`, {
				horizontalPosition: 'center',
				panelClass: 'updateSnack',
			});
			snack.onAction().subscribe(() => window.location.reload());
		});

		const user$ = this.angularFireAuth.user.pipe(untilDestroyed(this));
		user$.subscribe((user) => {
			this.appStore.update({
				user: user || undefined,
			});
		});

		console.log('fetching config');
		user$
			.pipe(
				filter((user) => !!user),
				switchMap((user) => this.appService.fetchConfig(user!.uid))
			)
			.subscribe();
	}

	logout() {
		this.angularFireAuth.signOut().then(() => {
			this.snackbar.open('Déconnecté', undefined, {
				duration: 3000,
			});
			this.router.navigateByUrl('/login');
		});
	}
}
