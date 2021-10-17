import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { weekdays } from '../model/weekday';
import { Title } from '@angular/platform-browser';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AppService } from '../../state/app.service';
import { AppQuery } from '../../state/app.query';
import { distinctUntilChanged, finalize, first, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { HotToastService } from '@ngneat/hot-toast';
import { Router } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MealService } from '../planning/meal/state/meal.service';
import { SettingsService } from './settings.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

@UntilDestroy()
@Component({
	selector: 'cb-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
	weekdays = Object.entries(weekdays).map(([key, value]) => ({ label: key, value }));
	form = new FormGroup({
		startWeekOn: new FormControl(undefined, Validators.required),
		city: new FormControl(undefined),
	});
	familyForm = new FormGroup({
		name: new FormControl('', [Validators.required, Validators.minLength(2)]),
	});

	userData$ = this.appQuery.select('userData');
	family$ = this.settingsService.family$;
	isManager$ = combineLatest([this.appQuery.select('user'), this.family$]).pipe(
		map(([user, family]) => user?.uid && user?.uid === family?.manager)
	);
	pending$: Observable<string[]> = this.family$.pipe(map((family) => family?.pending || []));
	loadingSubject = new BehaviorSubject(false);

	constructor(
		private title: Title,
		private appService: AppService,
		private appQuery: AppQuery,
		private toastService: HotToastService,
		private router: Router,
		private fns: AngularFireFunctions,
		private mealService: MealService,
		private settingsService: SettingsService
	) {
		this.userData$
			.pipe(distinctUntilChanged((a, b) => _.isEqual(a, b)))
			.subscribe((userData) => {
				if (userData) {
					const config = userData.config;
					this.form.setValue({
						startWeekOn: config.startWeekOn,
						city: config.city || '',
					});
					this.familyForm.setValue({
						name: userData.familyName || '',
					});
				}
			});
	}

	save() {
		this.appService.setConfig(this.form.value).then(() => {
			this.toastService.success('Préférences enregistrées');
			this.router.navigateByUrl('/');
		});
	}

	joinFamily(formValues: { name: string }) {
		this.loadingSubject.next(true);
		const callable = this.fns.httpsCallable('joinFamily');
		callable({ name: formValues.name })
			.pipe(finalize(() => this.loadingSubject.next(false)))
			.subscribe({
				next: () => {
					this.toastService.success(
						`Vous avez bien rejoint la famille ${formValues.name}`
					);
					this.mealService
						.syncCollection({
							reset: true,
						})
						.pipe(first())
						.subscribe();
				},
				error: (err) => {
					console.error(err);
					this.toastService.error(`Impossible de rejoindre la famille 😢`);
				},
			});
	}

	approvePending(familyName: string, uid: string) {
		this.loadingSubject.next(true);
		this.settingsService
			.approveOrDenyNewMember(familyName, uid, 'approve')
			.pipe(finalize(() => this.loadingSubject.next(false)))
			.subscribe(() => {
				this.toastService.success('Cette personne a bien été acceptée dans la famille');
			});
	}
	denyPending(familyName: string, uid: string) {
		this.loadingSubject.next(true);
		this.settingsService
			.approveOrDenyNewMember(familyName, uid, 'deny')
			.pipe(finalize(() => this.loadingSubject.next(false)))
			.subscribe(() => {
				this.toastService.success('Cette personne a bien été refusée');
			});
	}
}
