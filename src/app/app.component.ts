import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { SwUpdate } from '@angular/service-worker';
import { UntilDestroy } from '@ngneat/until-destroy';
import { HotToastService } from '@ngxpert/hot-toast';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { filter } from 'rxjs/operators';
import { AppStore } from '../state/app.store';
import { JowService } from './jow/state/jow.service';

@UntilDestroy()
@Component({
	selector: 'cb-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [fadeInOnEnterAnimation()],
	standalone: false,
})
export class AppComponent implements AfterViewInit {
	constructor(
		private swUpdate: SwUpdate,
		private toastService: HotToastService,
		private angularFireAuth: Auth,
		private appStore: AppStore,
		private jowService: JowService
	) {
		this.angularFireAuth.onAuthStateChanged((user) => {
			this.appStore.update({
				user: user || undefined,
			});
		});
		this.jowService.fetchFeatured();
	}

	@ViewChild('swUpdateTpl') swUpdateTpl: TemplateRef<any> | undefined;

	ngAfterViewInit() {
		this.swUpdate.versionUpdates
			.pipe(filter((event) => event.type === 'VERSION_READY'))
			.subscribe(() => {
				this.toastService.info(this.swUpdateTpl, {
					autoClose: false,
				});
			});
	}

	reloadApp() {
		window.location.reload();
	}
}
