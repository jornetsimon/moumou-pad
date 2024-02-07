import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealSwapDialogComponent } from './meal-swap-dialog/meal-swap-dialog.component';
import { NoteComponent } from './meal-form/note/note.component';
import { SharedModule } from '../../shared/shared.module';

const components = [MealSwapDialogComponent, NoteComponent];

@NgModule({
	declarations: [...components],
	exports: [...components],
	imports: [CommonModule, SharedModule],
})
export class MealModule {}
