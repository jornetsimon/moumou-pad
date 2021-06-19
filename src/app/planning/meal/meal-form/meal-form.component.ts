import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MealService } from '../state/meal.service';
import { Meal } from '../state/meal.model';

@Component({
	selector: 'cb-meal-form',
	templateUrl: './meal-form.component.html',
	styleUrls: ['./meal-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealFormComponent implements OnChanges {
	@Input() meal: Meal | undefined;
	@Output() onSave = new EventEmitter<void>();
	form = new FormGroup({
		name: new FormControl(undefined),
	});

	constructor(private mealService: MealService) {}

	ngOnChanges() {
		this.initializeForm();
	}

	initializeForm() {
		this.form.setValue({ name: this.meal?.name || '' });
	}

	saveMeal() {
		const date = this.meal!.date;
		const newData: Meal = {
			date,
			name: this.form.value.name,
		};
		if (this.meal?.name) {
			this.mealService.update(date, { name: newData.name });
		} else {
			this.mealService.add(newData);
		}
		this.onSave.emit();
	}
}
