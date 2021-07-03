import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanningComponent } from './planning/planning.component';
import { LoginComponent } from './auth/login/login.component';
import {
	AngularFireAuthGuard,
	redirectLoggedInTo,
	redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';

const routes: Routes = [
	{
		path: '',
		canActivate: [AngularFireAuthGuard],
		data: { authGuardPipe: () => redirectUnauthorizedTo(['login']) },
		children: [
			{
				path: '',
				component: PlanningComponent,
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
