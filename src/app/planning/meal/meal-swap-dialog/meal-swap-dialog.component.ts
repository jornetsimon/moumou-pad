import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Meal } from '../state/meal.model';
import { JowService } from '../../../jow/state/jow.service';

@Component({
	selector: 'cb-meal-swap-dialog',
	templateUrl: './meal-swap-dialog.component.html',
	styleUrls: ['./meal-swap-dialog.component.scss'],
})
export class MealSwapDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<MealSwapDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { from: Meal; to: Meal },
		public jowService: JowService
	) {}

	cancel() {
		this.dialogRef.close();
	}
}
