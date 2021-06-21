import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Meal } from './state/meal.model';
import { MealQuery } from './state/meal.query';
import { MatSnackBar } from '@angular/material/snack-bar';
import { collapseOnLeaveAnimation, expandOnEnterAnimation } from 'angular-animations';
import { JowService } from '../../jow/state/jow.service';

@Component({
	selector: 'cb-meal',
	templateUrl: './meal.component.html',
	styleUrls: ['./meal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [collapseOnLeaveAnimation(), expandOnEnterAnimation()],
})
export class MealComponent {
	@Input() meal!: Meal;
	editMode = false;

	constructor(
		private mealQuery: MealQuery,
		private snackBar: MatSnackBar,
		public jowService: JowService,
		private cd: ChangeDetectorRef
	) {}

	toggleEdit() {
		this.editMode = !this.editMode;
		this.cd.detectChanges();
	}

	afterSave() {
		this.snackBar.open(`Repas enregistré`, undefined, { duration: 4000 });
		this.editMode = false;
		this.cd.detectChanges();
	}
}
