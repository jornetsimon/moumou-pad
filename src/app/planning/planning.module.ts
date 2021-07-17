import { NgModule } from '@angular/core';
import { MealComponent } from './meal/meal.component';
import { PlanningComponent } from './planning.component';
import { SharedModule } from '../shared/shared.module';
import { MealFormComponent } from './meal/meal-form/meal-form.component';
import { MealSwapDialogComponent } from './meal/meal-swap-dialog/meal-swap-dialog.component';

@NgModule({
	declarations: [PlanningComponent, MealComponent, MealFormComponent, MealSwapDialogComponent],
	imports: [SharedModule],
})
export class PlanningModule {}
