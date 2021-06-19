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
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

registerLocaleData(fr);

@NgModule({
	declarations: [AppComponent],
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
	providers: [{ provide: LOCALE_ID, useValue: 'fr' }],
	bootstrap: [AppComponent],
})
export class AppModule {}
