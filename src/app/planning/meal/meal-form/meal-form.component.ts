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
import { createMeal, Meal } from '../state/meal.model';
import { JowService } from '../../../shared/jow.service';
import { map } from 'rxjs/operators';
import { shuffle } from 'lodash-es';
import { Recipe } from '../../../model/receipe';

@Component({
	selector: 'cb-meal-form',
	templateUrl: './meal-form.component.html',
	styleUrls: ['./meal-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealFormComponent implements OnChanges {
	@Input() meal: Meal | undefined;
	@Output() onSave = new EventEmitter<void>();
	recipeIdeas$ = this.jowService.getFeatured().pipe(map((recipes): Recipe[] => shuffle(recipes)));
	form = new FormGroup({
		name: new FormControl(undefined),
	});

	constructor(private mealService: MealService, private jowService: JowService) {}

	ngOnChanges() {
		this.initializeForm();
	}

	initializeForm() {
		this.form.setValue({ name: this.meal?.name || '' });
	}

	saveMeal() {
		const date = this.meal!.date;
		const type = this.meal!.type;
		if (this.meal?.name) {
			this.mealService.update(this.meal.id, { name: this.form.value.name });
		} else {
			const newMeal = createMeal({ date, type, name: this.form.value.name });
			this.mealService.add(newMeal);
		}
		this.onSave.emit();
	}
}
