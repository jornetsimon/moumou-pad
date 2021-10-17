import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStore } from '../state/app.store';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppService } from '../state/app.service';
import { HotToastService } from '@ngneat/hot-toast';
import { MealService } from './planning/meal/state/meal.service';
import { JowService } from './jow/state/jow.service';
import { AppQuery } from '../state/app.query';
import { MatDialog } from '@angular/material/dialog';
import { TvComponent } from './tv/tv.component';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { WeatherService } from './weather/weather.service';
import { Observable } from 'rxjs';
import { CityWeather } from './weather/model/cityWeather';

@UntilDestroy()
@Component({
	selector: 'cb-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [fadeInOnEnterAnimation()],
})
export class AppComponent implements AfterViewInit {
	@ViewChild('swUpdateTpl') swUpdateTpl: TemplateRef<any> | undefined;
	constructor(
		private update: SwUpdate,
		private toastService: HotToastService,
		public angularFireAuth: AngularFireAuth,
		private router: Router,
		private route: ActivatedRoute,
		private appStore: AppStore,
		private appService: AppService,
		private appQuery: AppQuery,
		private mealService: MealService,
		private jowService: JowService,
		private dialog: MatDialog,
		private bottomSheet: MatBottomSheet,
		private weatherService: WeatherService
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
				switchMap((user) => this.appService.fetchConfig(user!.uid)),
				switchMap(() =>
					this.mealService.syncCollection({
						reset: true,
					})
				)
			)
			.subscribe();

		this.jowService.fetchFeatured();
	}

	userData$ = this.appQuery.select('userData');
	family$ = this.userData$.pipe(
		map((userData) => {
			if (userData?.familyName && userData.isAllowedInFamily) {
				return userData?.familyName;
			}
			return undefined;
		})
	);

	weather$: Observable<CityWeather> = this.weatherService.weather$;
	weatherTemp$: Observable<number> = this.weatherService.temperature$;
	weatherIconUrl$ = this.weatherService.weatherIconUrl$;
	weatherTooltip$ = this.weather$.pipe(
		withLatestFrom(this.weatherTemp$),
		map(([weatherData, temp]) => `${weatherData.weather[0]?.description} • ${temp}°C`)
	);

	isHome$ = this.appService.isHome$;

	ngAfterViewInit() {
		this.update.available.subscribe(() => {
			this.toastService.info(this.swUpdateTpl, {
				autoClose: false,
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

	showTvProgram() {
		this.bottomSheet.open(TvComponent, { panelClass: 'tv-program-sheet' });
	}
}
