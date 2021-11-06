import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { environment } from '../environments/environment';
import { PlanningModule } from './planning/planning.module';
import { SharedModule } from './shared/shared.module';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RecipeModalComponent } from './jow/recipe-modal/recipe-modal.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AuthModule } from './auth/auth.module';
import { AppRoutingModule } from './app-routing.module';
import { HotToastModule } from '@ngneat/hot-toast';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';

registerLocaleData(fr);

@NgModule({
	declarations: [AppComponent, RecipeModalComponent],
	imports: [
		BrowserModule,
		environment.production ? [] : AkitaNgDevtools.forRoot(),
		provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
		provideFirestore(() => {
			const firestore = getFirestore();
			if (environment.useEmulators) {
				connectFirestoreEmulator(firestore, 'localhost', 8080);
			}
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
		AuthModule,
		PlanningModule,
		BrowserAnimationsModule,
		SharedModule,
		AppRoutingModule,
		HotToastModule.forRoot({
			position: 'bottom-center',
		}),
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
			// Register the ServiceWorker as soon as the app is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000',
		}),
	],
	providers: [{ provide: LOCALE_ID, useValue: 'fr' }],
	bootstrap: [AppComponent],
})
export class AppModule {}
