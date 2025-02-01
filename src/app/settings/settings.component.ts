import { CommonModule, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { weekdays, WeekdayValue } from '@functions/model/weekday.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { HotToastService } from '@ngxpert/hot-toast';
import {
	TuiButtonModule,
	TuiDataListModule,
	TuiLoaderModule,
	TuiTextfieldControllerModule,
	TuiValueContentContext,
} from '@taiga-ui/core';
import { TuiIconModule } from '@taiga-ui/experimental';
import {
	TuiDataListWrapperModule,
	TuiFilterByInputPipeModule,
	TuiInputModule,
	TuiIslandModule,
	TuiSelectModule,
} from '@taiga-ui/kit';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, combineLatest, from, Observable } from 'rxjs';
import {
	distinctUntilChanged,
	finalize,
	first,
	map,
	startWith,
	switchMap,
	tap,
} from 'rxjs/operators';
import { AppQuery } from '../../state/app.query';
import { AppService } from '../../state/app.service';
import { SettingsService } from './settings.service';

@UntilDestroy()
@Component({
	selector: 'cb-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.less'],
	imports: [
		CommonModule,
		TuiSelectModule,
		ReactiveFormsModule,
		TuiFilterByInputPipeModule,
		TuiDataListModule,
		TuiDataListWrapperModule,
		TuiInputModule,
		TuiTextfieldControllerModule,
		TuiButtonModule,
		TuiLoaderModule,
		MatIconModule,
		TuiIslandModule,
		TuiIconModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
	constructor(
		private readonly appService: AppService,
		private readonly appQuery: AppQuery,
		private readonly toastService: HotToastService,
		private readonly router: Router,
		private readonly fns: Functions,
		private readonly settingsService: SettingsService
	) {
		this.user$
			.pipe(
				first(Boolean),
				switchMap((user) => this.appService.fetchConfig(user.uid)),
				untilDestroyed(this)
			)
			.subscribe();

		this.userData$
			.pipe(
				distinctUntilChanged((a, b) => isEqual(a, b)),
				tap((userData) => {
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
				}),
				untilDestroyed(this)
			)
			.subscribe();
	}

	readonly weekdays = Object.entries(weekdays).map(([key, value]) => ({ label: key, value }));

	readonly form = new FormGroup({
		startWeekOn: new FormControl<WeekdayValue>(0, {
			nonNullable: true,
			validators: Validators.required,
		}),
		city: new FormControl<string | undefined>(undefined, { nonNullable: true }),
	});

	readonly familyForm = new FormGroup({
		name: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(2)],
		}),
	});

	private readonly user$ = this.appQuery.select('user');

	readonly userData$ = this.appQuery.select('userData');
	readonly family$ = this.settingsService.family$.pipe(startWith(undefined));
	readonly isManager$ = combineLatest([this.user$, this.family$]).pipe(
		map(([user, family]) => user?.uid && user?.uid === family?.manager)
	);
	readonly pending$: Observable<string[]> = this.family$.pipe(
		map((family) => family?.pending || [])
	);

	readonly isWaitingForApproval$ = combineLatest([this.userData$, this.isManager$]).pipe(
		map(([userData, isManager]) => !isManager && !userData?.isAllowedInFamily)
	);

	private readonly isLoading$$ = new BehaviorSubject(false);
	readonly isLoading$ = this.isLoading$$.asObservable();

	readonly getWeekdayLabel: PolymorpheusContent<TuiValueContentContext<WeekdayValue>> = (
		value
	) => {
		const label = this.weekdays.find((day) => day.value === value.$implicit)?.label || '';
		const titleCasePipe = new TitleCasePipe();
		return titleCasePipe.transform(label);
	};

	save() {
		const userConfig = this.form.getRawValue();
		this.appService.setConfig(userConfig).then(() => {
			this.toastService.success('Préférences enregistrées');
			this.router.navigateByUrl('/');
		});
	}

	joinFamily(familyName: string) {
		this.isLoading$$.next(true);
		const callable = httpsCallable<{ name: string }, void>(this.fns, 'joinFamily');
		from(callable({ name: familyName }))
			.pipe(finalize(() => this.isLoading$$.next(false)))
			.subscribe({
				next: () => {
					this.toastService.success(
						`Vous avez bien rejoint la famille ${familyName}. L'application va se recharger pour prendre en compte les changements.`
					);
					setTimeout(() => {
						window.location.reload();
					}, 5000);
				},
				error: (err) => {
					console.error(err);
					this.toastService.error(`Impossible de rejoindre la famille 😢`);
				},
			});
	}

	approvePending(familyName: string, uid: string) {
		this.isLoading$$.next(true);
		this.settingsService
			.approveOrDenyNewMember(familyName, uid, 'approve')
			.pipe(finalize(() => this.isLoading$$.next(false)))
			.subscribe(() => {
				this.toastService.success('Cette personne a bien été acceptée dans la famille');
			});
	}
	denyPending(familyName: string, uid: string) {
		this.isLoading$$.next(true);
		this.settingsService
			.approveOrDenyNewMember(familyName, uid, 'deny')
			.pipe(finalize(() => this.isLoading$$.next(false)))
			.subscribe(() => {
				this.toastService.success('Cette personne a bien été refusée');
			});
	}
}
