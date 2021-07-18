import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AppStore } from '../state/app.store';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, first, switchMap } from 'rxjs/operators';
import { AppService } from '../state/app.service';
import { HotToastService } from '@ngneat/hot-toast';
import { MealService } from './planning/meal/state/meal.service';
import { JowService } from './jow/state/jow.service';

@UntilDestroy()
@Component({
	selector: 'cb-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
	@ViewChild('swUpdateTpl') swUpdateTpl: TemplateRef<any> | undefined;
	constructor(
		private update: SwUpdate,
		private toastService: HotToastService,
		public angularFireAuth: AngularFireAuth,
		private router: Router,
		private appStore: AppStore,
		private appService: AppService,
		private mealService: MealService,
		private jowService: JowService
	) {
		const user$ = this.angularFireAuth.user.pipe(untilDestroyed(this));
		user$.subscribe((user) => {
			this.appStore.update({
				user: user || undefined,
			});
		});

		// Fetch user config
		user$
			.pipe(
				filter((user) => !!user),
				switchMap((user) => this.appService.fetchConfig(user!.uid))
			)
			.subscribe();

		// Subscribe to the Firestore collection
		user$
			.pipe(
				first((user) => !!user),
				switchMap(() =>
					this.mealService.syncCollection({
						reset: true,
					})
				),
				untilDestroyed(this)
			)
			.subscribe();

		this.jowService.fetchFeatured();
	}

	ngAfterViewInit() {
		this.update.available.subscribe(() => {
			this.toastService.info(this.swUpdateTpl, {
				icon: '🔄',
			});
		});
	}

	logout() {
		this.angularFireAuth.signOut().then(() => {
			this.toastService.show('Déconnecté', {
				duration: 3000,
			});
			this.router.navigateByUrl('/login');
		});
	}

	reloadApp() {
		window.location.reload();
	}
}
