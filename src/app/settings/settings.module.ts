import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
	declarations: [SettingsComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([{ path: '', component: SettingsComponent }]),
		SharedModule,
	],
})
export class SettingsModule {}
