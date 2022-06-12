import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CalendarSelectionComponent } from './calendar-selection/calendar-selection.component';

@NgModule({
	declarations: [SettingsComponent, CalendarSelectionComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([{ path: '', component: SettingsComponent }]),
		SharedModule,
	],
})
export class SettingsModule {}
