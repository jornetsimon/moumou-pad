import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Recipe } from '../../model/receipe';
import { JowService } from '../state/jow.service';

export interface RecipeModalData {
	recipe: Recipe;
	isSelected: boolean;
}

@Component({
	selector: 'cb-recipe-modal',
	templateUrl: './recipe-modal.component.html',
	styleUrls: ['./recipe-modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeModalComponent {
	constructor(
		public dialogRef: MatDialogRef<RecipeModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: RecipeModalData,
		@Inject(JowService) public jowService: JowService
	) {}

	addToMeal() {}
	closeModal() {
		this.dialogRef.close();
	}
}
