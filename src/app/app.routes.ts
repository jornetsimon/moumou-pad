import { Routes } from '@angular/router';
import { PlanningComponent } from './planning/planning.component';
import { LoginComponent } from './auth/login/login.component';
import {
	AngularFireAuthGuard,
	redirectLoggedInTo,
	redirectUnauthorizedTo,
} from './auth/angular-fire-auth.guard';
import { ShellComponent } from '../shell/shell.component';

export const routes: Routes = [
	{
		path: '',
		component: ShellComponent,
		canActivate: [AngularFireAuthGuard],
		data: { authGuardPipe: () => redirectUnauthorizedTo(['login']) },
		children: [
			{
				path: '',
				component: PlanningComponent,
			},
			{
				path: 'settings',
				loadChildren: () =>
					import('./settings/settings.module').then((m) => m.SettingsModule),
			},
		],
	},
	{
		path: 'login',
		component: LoginComponent,
		canActivate: [AngularFireAuthGuard],
		data: { authGuardPipe: () => redirectLoggedInTo(['']) },
	},
	{ path: '**', redirectTo: '/' },
];
