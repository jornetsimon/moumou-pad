import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { TvModule } from '../tv/tv.module';
import { MealModule } from '../meal/meal.module';
import { CalendarModule } from '../calendar/calendar.module';

@NgModule({
	declarations: [HomeComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: HomeComponent,
			},
		]),
		SharedModule,
		TvModule,
		MealModule,
		CalendarModule,
	],
})
export class HomeModule {}
