import { NgModule } from '@angular/core';
import { PlanningComponent } from './planning.component';
import { SharedModule } from '../shared/shared.module';
import { TvModule } from '../tv/tv.module';
import { MealModule } from './meal/meal.module';
import { CalendarModule } from '../calendar/calendar.module';

@NgModule({
	declarations: [PlanningComponent],
	imports: [SharedModule, TvModule, MealModule, CalendarModule],
})
export class PlanningModule {}
