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
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { SharedModule } from './shared/shared.module';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
	connectFirestoreEmulator,
	enableIndexedDbPersistence,
	getFirestore,
	provideFirestore,
} from '@angular/fire/firestore';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { SearchModule } from './search/search.module';
import { LoginComponent } from './auth/login/login.component';
import { provideHotToastConfig } from '@ngneat/hot-toast';
import { TuiAvatarModule, TuiSelectModule } from '@taiga-ui/kit';

registerLocaleData(fr);

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
		SharedModule,
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
			// Register the ServiceWorker as soon as the app is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000',
		}),
		SearchModule,
		TuiRootModule,
		TuiDialogModule,
		TuiAlertModule,
		TuiAvatarModule,
		TuiHostedDropdownModule,
		TuiDataListModule,
		TuiSvgModule,
		TuiSelectModule,
	],
	providers: [
		{ provide: LOCALE_ID, useValue: 'fr' },
		provideHotToastConfig({
			position: 'bottom-center',
		}),
		{ provide: TUI_SANITIZER, useClass: NgDompurifySanitizer },
	],
	bootstrap: [AppComponent],
	exports: [],
})
export class AppModule {}
