import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { HotToastService } from '@ngneat/hot-toast';
import { Auth, user } from '@angular/fire/auth';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AppQuery } from '../../state/app.query';
import { TuiDataListModule, TuiHostedDropdownModule, TuiSvgModule } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { TuiAppBarModule } from '@taiga-ui/addon-mobile';
import { WeatherComponent } from '../weather/weather.component';

@Component({
    selector: 'cb-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less'],
    imports: [
        TuiSvgModule,
        CommonModule,
        TuiDataListModule,
        RouterLink,
        RouterLinkActive,
        MatIconModule,
        TuiHostedDropdownModule,
        TuiAvatarModule,
        TuiAppBarModule,
        WeatherComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
	constructor(
		private toastService: HotToastService,
		private angularFireAuth: Auth,
		private router: Router,
		private appQuery: AppQuery
	) {}

	firebaseUser$ = this.appQuery.select('user');
	userData$ = this.appQuery.select('userData');
	family$ = this.userData$.pipe(
		map((userData) => {
			if (userData?.familyName && userData.isAllowedInFamily) {
				return userData?.familyName;
			}
			return undefined;
		})
	);

	logout() {
		this.angularFireAuth.signOut().then(() => {
			this.toastService.info('Déconnecté', {
				duration: 3000,
			});
			this.router.navigateByUrl('/login');
		});
	}

	protected readonly user = user;
}
