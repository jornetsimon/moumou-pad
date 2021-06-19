import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Meal } from './state/meal.model';
import { MealQuery } from './state/meal.query';
import { MatSnackBar } from '@angular/material/snack-bar';
import { collapseOnLeaveAnimation, expandOnEnterAnimation } from 'angular-animations';

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

	constructor(private mealQuery: MealQuery, private snackBar: MatSnackBar) {}

	toggleEdit() {
		this.editMode = !this.editMode;
	}

	afterSave() {
		this.snackBar.open(`Repas enregistré`, undefined, { duration: 4000 });
		this.editMode = false;
	}
}
