import { NgModule } from '@angular/core';
import { MealComponent } from './meal/meal.component';
import { PlanningComponent } from './planning.component';
import { SharedModule } from '../shared/shared.module';
import { MealFormComponent } from './meal/meal-form/meal-form.component';
import { MealSwapDialogComponent } from './meal/meal-swap-dialog/meal-swap-dialog.component';
import { NoteComponent } from './meal/meal-form/note/note.component';
import { TvModule } from '../tv/tv.module';

@NgModule({
	declarations: [
		PlanningComponent,
		MealComponent,
		MealFormComponent,
		MealSwapDialogComponent,
		NoteComponent,
	],
	imports: [SharedModule, TvModule],
})
export class PlanningModule {}
