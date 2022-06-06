import { NgModule } from '@angular/core';
import { PlanningComponent } from './planning.component';
import { SharedModule } from '../shared/shared.module';
import { TvModule } from '../tv/tv.module';
import { MealModule } from '../meal/meal.module';
import { RouterModule } from '@angular/router';

@NgModule({
	declarations: [PlanningComponent],
	imports: [
		SharedModule,
		RouterModule.forChild([
			{
				path: '',
				component: PlanningComponent,
			},
		]),
		TvModule,
		MealModule,
	],
})
export class PlanningModule {}
