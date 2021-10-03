import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MealService } from '../state/meal.service';
import { createMeal, Meal } from '../state/meal.model';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { pickBy, shuffle } from 'lodash-es';
import { Recipe } from '../../../model/receipe';
import { JowQuery } from '../../../jow/state/jow.query';
import { MatDialog } from '@angular/material/dialog';
import { RecipeModalComponent } from '../../../jow/recipe-modal/recipe-modal.component';
import { Observable, of } from 'rxjs';
import { JowService } from '../../../jow/state/jow.service';
import { NoteComponent } from './note/note.component';
import { RenderService } from '../../../shared/render.service';

@Component({
	selector: 'cb-meal-form',
	templateUrl: './meal-form.component.html',
	styleUrls: ['./meal-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealFormComponent implements OnChanges {
	@Input() meal: Meal | undefined;
	@Output() mealSaved = new EventEmitter<void>();
	loadingSearchResults = false;
	recipeIdeas$ = this.jowQuery
		.select('featured')
		.pipe(map((recipes): Recipe[] => shuffle(recipes)));

	extrasFg = new FormGroup({
		croquettes: new FormControl(false),
		freezer: new FormControl(false),
		outOfHome: new FormControl(false),
		prepared: new FormControl(false),
	});
	form = new FormGroup({
		name: new FormControl(undefined),
		searchTerm: new FormControl(undefined),
		extras: this.extrasFg,
		alternateDish: new FormGroup({
			name: new FormControl(undefined),
			show: new FormControl(false),
		}),
	});

	recipeSearchResults$: Observable<Recipe[]> = this.form.get('searchTerm')!.valueChanges.pipe(
		filter((term) => typeof term === 'string'),
		debounceTime(500),
		tap(() => {
			this.loadingSearchResults = true;
			this.cd.detectChanges();
		}),
		switchMap((term) => (term ? this.jowService.search(term) : of([]))),
		tap(() => {
			this.loadingSearchResults = false;
			this.cd.detectChanges();
		})
	);
	displayWithFn = (recipe: Recipe | undefined) => recipe?.title || '';
	jowRecipe: Recipe | null = null;
	recipeMemo: string | null = null;

	constructor(
		private mealService: MealService,
		private jowQuery: JowQuery,
		public dialog: MatDialog,
		public jowService: JowService,
		private cd: ChangeDetectorRef,
		public sanitizerService: RenderService
	) {}

	ngOnChanges(changes: SimpleChanges) {
		this.initializeForm();

		if (
			changes.meal &&
			this.meal?.jowRecipe &&
			this.meal.jowRecipe._id !== this.jowRecipe?._id
		) {
			this.jowRecipe = this.meal.jowRecipe;
			this.cd.detectChanges();
		}
	}

	initializeForm() {
		this.form.patchValue({
			name: this.meal?.name || '',
			searchTerm: '',
			extras: this.meal?.extras,
			alternateDish: {
				name: this.meal?.alternateDish?.name || null,
				show: !!this.meal?.alternateDish?.name,
			},
		});
	}

	saveMeal() {
		const date = this.meal!.date;
		const type = this.meal!.type;
		const meal = {
			name: this.form.value.name,
			jowRecipe: this.jowRecipe,
			extras: this.extrasFg.value,
			alternateDish: this.form.value.alternateDish,
			recipeMemo: this.recipeMemo || this.meal?.recipeMemo,
		};
		if (this.meal?.name) {
			this.mealService.update(
				this.meal.id,
				pickBy(meal, (p) => p !== undefined)
			);
		} else {
			const freshMeal = createMeal({
				...meal,
				date,
				type,
			});
			this.mealService.add(pickBy(freshMeal, (p) => p !== undefined));
		}
		this.mealSaved.emit();
	}

	openRecipeModal(recipe: Recipe) {
		const dialogRef = this.dialog.open(RecipeModalComponent, {
			data: {
				recipe,
				isSelected: this.jowRecipe && this.jowRecipe._id === recipe._id,
			},
			autoFocus: false,
		});

		dialogRef.afterClosed().subscribe((result: Recipe | undefined) => {
			if (result) {
				this.onRecipeSelected(result);
			}
		});
	}

	onRecipeSelected(recipe: Recipe) {
		this.jowRecipe = recipe;
		const nameFc = this.form.get('name')!;
		nameFc.setValue(recipe.title);
	}

	onRecipeRemoved() {
		this.jowRecipe = null;
		this.form.get('searchTerm')!.reset();
		this.form.get('name')?.setValue('');
	}

	toggleExtra(formControlName: string) {
		const control = this.extrasFg.get(formControlName);
		if (!control) {
			return;
		}
		const currentValue = !!control.value;
		control.setValue(!currentValue);
	}

	showAlternateDish() {
		this.form.get('alternateDish')!.get('show')?.setValue(true);
	}

	openNoteDialog() {
		const dialogRef = this.dialog.open(NoteComponent, {
			data: {
				content: this.recipeMemo || this.meal!.recipeMemo,
			},
			autoFocus: false,
		});

		dialogRef.afterClosed().subscribe((note: string | undefined) => {
			this.recipeMemo = note || null;
			this.cd.detectChanges();
		});
	}
}
