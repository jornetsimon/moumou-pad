import { NgModule } from '@angular/core';
import { MealComponent } from './meal/meal.component';
import { PlanningComponent } from './planning.component';
import { SharedModule } from '../shared/shared.module';
import { MealFormComponent } from './meal/meal-form/meal-form.component';

@NgModule({
	declarations: [PlanningComponent, MealComponent, MealFormComponent],
	imports: [SharedModule],
})
export class PlanningModule {}
