import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { weekdays } from '../model/weekday';
import { Title } from '@angular/platform-browser';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AppService } from '../../state/app.service';
import { AppQuery } from '../../state/app.query';
import { distinctUntilChanged } from 'rxjs/operators';
import * as _ from 'lodash';
import { HotToastService } from '@ngneat/hot-toast';

@UntilDestroy()
@Component({
	selector: 'cb-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
	weekdays = Object.entries(weekdays).map(([key, value]) => ({ label: key, value }));
	form = new FormGroup({
		startWeekOn: new FormControl(),
	});

	constructor(
		private title: Title,
		private appService: AppService,
		private appQuery: AppQuery,
		private toastService: HotToastService
	) {
		this.appQuery
			.select('userData')
			.pipe(distinctUntilChanged((a, b) => _.isEqual(a, b)))
			.subscribe((userData) => {
				const config = userData?.config;
				console.log(config);
				this.form.setValue({
					startWeekOn: config?.startWeekOn ?? null,
				});
			});
	}

	save() {
		this.appService
			.setConfig(this.form.value)
			.then(() => this.toastService.success('Préférences enregistrées'));
	}
}
