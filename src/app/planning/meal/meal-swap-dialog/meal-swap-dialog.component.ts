import { Component, Inject } from '@angular/core';
import { Meal } from '../state/meal.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { constructAssetUrl } from '../../../jow/util';

@Component({
	selector: 'cb-meal-swap-dialog',
	templateUrl: './meal-swap-dialog.component.html',
	styleUrls: ['./meal-swap-dialog.component.scss'],
})
export class MealSwapDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<MealSwapDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { from: Meal; to: Meal }
	) {}

	protected readonly constructAssetUrl = constructAssetUrl;

	cancel() {
		this.dialogRef.close();
	}
}
