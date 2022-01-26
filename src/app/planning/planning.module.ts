import { NgModule } from '@angular/core';
import { PlanningComponent } from './planning.component';
import { SharedModule } from '../shared/shared.module';
import { TvModule } from '../tv/tv.module';
import { MealModule } from './meal/meal.module';

@NgModule({
	declarations: [PlanningComponent],
	imports: [SharedModule, TvModule, MealModule],
})
export class PlanningModule {}
