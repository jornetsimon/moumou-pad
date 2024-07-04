import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import {
	TUI_SANITIZER,
	TuiAlertModule,
	TuiDataListModule,
	TuiDialogModule,
	TuiHostedDropdownModule,
	TuiRootModule,
	TuiSvgModule,
} from '@taiga-ui/core';
import { LOCALE_ID, NgModule } from '@angular/core';
import {
	BrowserModule,
	HAMMER_GESTURE_CONFIG,
	HammerGestureConfig,
	HammerModule,
} from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
	connectFirestoreEmulator,
	enableIndexedDbPersistence,
	getFirestore,
	provideFirestore,
} from '@angular/fire/firestore';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { LoginComponent } from './auth/login/login.component';
import { provideHotToastConfig } from '@ngneat/hot-toast';
import { TuiAvatarModule, TuiSelectModule } from '@taiga-ui/kit';
import { TUI_DIALOG_CLOSES_ON_BACK } from '@taiga-ui/cdk';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import * as Hammer from 'hammerjs';

registerLocaleData(fr);

export class MyHammerConfig extends HammerGestureConfig {
	overrides = <any>{
		swipe: { direction: Hammer.DIRECTION_ALL },
	};
}

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
		provideFirestore(() => {
			const firestore = getFirestore();
			if (environment.useEmulators) {
				connectFirestoreEmulator(firestore, 'localhost', 8080);
			}
			enableIndexedDbPersistence(firestore);
			return firestore;
		}),
		provideAuth(() => {
			const auth = getAuth();
			if (environment.useEmulators) {
				connectAuthEmulator(auth, 'http://localhost:9099');
			}
			return auth;
		}),
		provideFunctions(() => {
			const functions = getFunctions(undefined, 'europe-west1');
			if (environment.useEmulators) {
				connectFunctionsEmulator(functions, 'localhost', 5001);
			}
			return functions;
		}),
		LoginComponent,
		BrowserAnimationsModule,
		RouterModule.forRoot(routes),
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
			// Register the ServiceWorker as soon as the app is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000',
		}),
		TuiRootModule,
		TuiDialogModule,
		TuiAlertModule,
		TuiAvatarModule,
		TuiHostedDropdownModule,
		TuiDataListModule,
		TuiSvgModule,
		TuiSelectModule,
		HammerModule,
	],
	providers: [
		{ provide: LOCALE_ID, useValue: 'fr' },
		provideHotToastConfig({
			position: 'bottom-center',
		}),
		{ provide: TUI_SANITIZER, useClass: NgDompurifySanitizer },
		{
			provide: TUI_DIALOG_CLOSES_ON_BACK,
			useValue: of(true),
		},
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: MyHammerConfig,
		},
	],
	bootstrap: [AppComponent],
	exports: [],
})
export class AppModule {}
