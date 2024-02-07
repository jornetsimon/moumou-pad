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
import { pickBy } from 'lodash-es';
import { Recipe } from '../../../model/receipe';
import { JowQuery } from '../../../jow/state/jow.query';
import { JowService } from '../../../jow/state/jow.service';
import { NoteComponent } from './note/note.component';
import { RenderService } from '../../../shared/render.service';
import { MealQuery } from '../state/meal.query';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import {
	TuiDataListWrapperModule,
	TuiFieldErrorPipeModule,
	TuiFilterByInputPipeModule,
	TuiInputModule,
	TuiIslandModule,
} from '@taiga-ui/kit';
import {
	TuiButtonModule,
	TuiErrorModule,
	TuiHintModule,
	TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { TuiChipModule } from '@taiga-ui/experimental';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';
import { constructAssetUrl } from '../../../jow/util';
import { RecipeModalComponent } from '../../../jow/recipe-modal/recipe-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { RecipeExplorerComponent } from './recipe-explorer/recipe-explorer.component';

@Component({
	selector: 'cb-meal-form',
	templateUrl: './meal-form.component.html',
	styleUrls: ['./meal-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		SharedModule,
		TuiInputModule,
		TuiErrorModule,
		TuiFieldErrorPipeModule,
		TuiTextfieldControllerModule,
		TuiDataListWrapperModule,
		TuiFilterByInputPipeModule,
		TuiIslandModule,
		TuiButtonModule,
		TuiHintModule,
		TuiChipModule,
		RecipeCardComponent,
		RecipeExplorerComponent,
	],
})
export class MealFormComponent implements OnChanges {
	constructor(
		private readonly mealQuery: MealQuery,
		private readonly mealService: MealService,
		private readonly jowQuery: JowQuery,
		private readonly jowService: JowService,
		private readonly dialog: MatDialog,
		private readonly cd: ChangeDetectorRef,
		public readonly sanitizerService: RenderService
	) {}

	@Input() meal: Meal | undefined;
	@Input() isReadonly = false;
	@Output() mealSaved = new EventEmitter<void>();

	extrasFg = new FormGroup({
		croquettes: new FormControl<boolean>(false, { nonNullable: true }),
		freezer: new FormControl<boolean>(false, { nonNullable: true }),
		outOfHome: new FormControl<boolean>(false, { nonNullable: true }),
		prepared: new FormControl<boolean>(false, { nonNullable: true }),
	});
	form = new FormGroup({
		name: new FormControl<string | undefined>(undefined, { nonNullable: true }),
		extras: this.extrasFg,
		alternateDish: new FormGroup({
			name: new FormControl<string | null>(null, { nonNullable: true }),
			show: new FormControl<boolean>(false, { nonNullable: true }),
		}),
	});

	nameSuggestions$ = this.mealQuery.nameSuggestions$;

	jowRecipe: Recipe | null = null;
	recipeMemo: string | null = null;

	readonly constructAssetUrl = constructAssetUrl;

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
		this.form.get('name')?.setValue('');
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
