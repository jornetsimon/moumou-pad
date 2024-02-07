import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Recipe } from '../../model/receipe';
import { JowService } from '../state/jow.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { constructAssetUrl, constructRecipeUrl } from '../util';

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
		public dialogRef: MatDialogRef<RecipeModalComponent, RecipeModalData>,
		@Inject(MAT_DIALOG_DATA) public data: RecipeModalData,
		@Inject(JowService) public jowService: JowService
	) {}

	protected readonly constructAssetUrl = constructAssetUrl;

	addToMeal() {}

	closeModal() {
		this.dialogRef.close();
	}

	protected readonly constructRecipeUrl = constructRecipeUrl;
}
