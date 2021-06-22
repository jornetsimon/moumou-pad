import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'cb-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	constructor(update: SwUpdate, snackbar: MatSnackBar) {
		update.available.subscribe((upd: any) => {
			const snack = snackbar.open('Une mise à jour est disponible', `C'est parti !`, {
				horizontalPosition: 'center',
				panelClass: 'updateSnack',
			});
			snack.onAction().subscribe((value) => window.location.reload());
		});
	}
}
