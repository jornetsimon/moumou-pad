import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealFormComponent } from './meal-form/meal-form.component';
import { MealSwapDialogComponent } from './meal-swap-dialog/meal-swap-dialog.component';
import { NoteComponent } from './meal-form/note/note.component';
import { SharedModule } from '../../shared/shared.module';

const components = [MealFormComponent, MealSwapDialogComponent, NoteComponent];

@NgModule({
	declarations: [...components],
	exports: [...components],
	imports: [CommonModule, SharedModule],
})
export class MealModule {}
