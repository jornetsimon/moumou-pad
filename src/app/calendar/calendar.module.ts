import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './calendar.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [CalendarComponent],
	exports: [CalendarComponent],
	imports: [CommonModule, SharedModule],
})
export class CalendarModule {}
