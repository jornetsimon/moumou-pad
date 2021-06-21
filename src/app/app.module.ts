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
import { AngularFireModule } from '@angular/fire';
import {
	AngularFirestoreModule,
	USE_EMULATOR as USE_FIRESTORE_EMULATOR,
} from '@angular/fire/firestore';
import {
	AngularFireFunctionsModule,
	REGION,
	USE_EMULATOR as USE_FUNCTIONS_EMULATOR,
} from '@angular/fire/functions';
import { RecipeModalComponent } from './jow/recipe-modal/recipe-modal.component';

registerLocaleData(fr);

@NgModule({
	declarations: [AppComponent, RecipeModalComponent],
	imports: [
		BrowserModule,
		environment.production ? [] : AkitaNgDevtools.forRoot(),
		AngularFireModule.initializeApp(environment.firebaseConfig),
		AngularFirestoreModule,
		AngularFireFunctionsModule,
		PlanningModule,
		BrowserAnimationsModule,
		SharedModule,
	],
	providers: [
		{ provide: LOCALE_ID, useValue: 'fr' },
		{
			provide: USE_FIRESTORE_EMULATOR,
			useValue: environment.useEmulators ? ['localhost', 8080] : undefined,
		},
		{
			provide: USE_FUNCTIONS_EMULATOR,
			useValue: environment.useEmulators ? ['localhost', 5001] : undefined,
		},
		{ provide: REGION, useValue: 'europe-west1' },
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
