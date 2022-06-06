import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import {
	AngularFireAuthGuard,
	redirectLoggedInTo,
	redirectUnauthorizedTo,
} from './auth/angular-fire-auth.guard';

const routes: Routes = [
	{
		path: '',
		canActivate: [AngularFireAuthGuard],
		data: { authGuardPipe: () => redirectUnauthorizedTo(['login']) },
		children: [
			{
				path: '',
				loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
			},
			{
				path: 'legacy',
				loadChildren: () =>
					import('./planning/planning.module').then((m) => m.PlanningModule),
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

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
