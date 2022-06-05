import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './calendar.component';

@NgModule({
	declarations: [CalendarComponent],
	exports: [CalendarComponent],
	imports: [CommonModule],
})
export class CalendarModule {}
