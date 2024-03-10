import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Inject,
	Injector,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MealService } from '../state/meal.service';
import { createMeal, Meal } from '../state/meal.model';
import { pickBy } from 'lodash-es';
import { Recipe } from '../../../model/receipe';
import { MemoDialogComponent, MemoDialogOutput } from './memo-dialog/memo-dialog.component';
import { RenderRichTextPipe } from '../../../shared/render-rich-text.pipe';
import { MealQuery } from '../state/meal.query';
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
	TuiDialogService,
	TuiErrorModule,
	TuiHintModule,
	TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { TuiChipModule } from '@taiga-ui/experimental';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';
import { constructAssetUrl } from '../../../jow/util';
import { RecipeModalComponent } from '../../../jow/recipe-modal/recipe-modal.component';
import { RecipeExplorerComponent } from './recipe-explorer/recipe-explorer.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { map, tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TuiRippleModule } from '@taiga-ui/addon-mobile';
import { MatIconModule } from '@angular/material/icon';
import { NgxVibrationModule } from 'ngx-vibration';

@UntilDestroy()
@Component({
	selector: 'cb-meal-form',
	templateUrl: './meal-form.component.html',
	styleUrls: ['./meal-form.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
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
		TuiRippleModule,
		MatIconModule,
		ReactiveFormsModule,
		NgxVibrationModule,
		RenderRichTextPipe,
	],
})
export class MealFormComponent implements OnChanges {
	constructor(
		private readonly mealQuery: MealQuery,
		private readonly mealService: MealService,
		private readonly cd: ChangeDetectorRef,
		@Inject(Injector) private readonly injector: Injector,
		@Inject(TuiDialogService) private readonly dialogs: TuiDialogService
	) {}

	@Input() meal: Meal | undefined;
	@Input() isReadonly = false;
	@Output() mealSaved = new EventEmitter<void>();

	readonly extrasFg = new FormGroup({
		croquettes: new FormControl<boolean>(false, { nonNullable: true }),
		freezer: new FormControl<boolean>(false, { nonNullable: true }),
		outOfHome: new FormControl<boolean>(false, { nonNullable: true }),
		prepared: new FormControl<boolean>(false, { nonNullable: true }),
	});

	readonly form = new FormGroup({
		name: new FormControl<string | undefined>(undefined, { nonNullable: true }),
		memo: new FormControl<string | null>(null),
		extras: this.extrasFg,
		alternateDish: new FormGroup({
			name: new FormControl<string | null>(null, { nonNullable: true }),
			show: new FormControl<boolean>(false, { nonNullable: true }),
		}),
	});

	nameSuggestions$ = this.mealQuery.nameSuggestions$;

	jowRecipe: Recipe | null = null;

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
			memo: this.meal?.recipeMemo || null,
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
			recipeMemo: this.getRecipeMemo(),
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
		this.dialogs
			.open<Recipe | undefined>(
				new PolymorpheusComponent(RecipeModalComponent, this.injector),
				{
					data: {
						recipe,
						isSelected: !!(this.jowRecipe && this.jowRecipe._id === recipe._id),
					},
				}
			)
			.pipe(
				tap((recipe) => {
					if (recipe) {
						this.onRecipeSelected(recipe);
					}
				}),
				untilDestroyed(this)
			)
			.subscribe();
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
		this.dialogs
			.open<MemoDialogOutput>(new PolymorpheusComponent(MemoDialogComponent, this.injector), {
				data: this.form.controls.memo.value,
			})
			.pipe(
				map((note) => note || null),
				tap((note) => {
					this.form.controls.memo.setValue(note);
					this.cd.detectChanges();
				}),
				untilDestroyed(this)
			)
			.subscribe();
	}

	getRecipeMemo() {
		const formValue = this.form.controls.memo.value;
		return formValue !== undefined ? formValue : this.meal?.recipeMemo;
	}
}
