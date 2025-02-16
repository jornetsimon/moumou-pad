import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
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
	TuiGroupModule,
	TuiHintModule,
	TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { TuiChipModule } from '@taiga-ui/experimental';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';
import { constructAssetUrl } from '../../../jow/util';
import { RecipeExplorerComponent } from './recipe-explorer/recipe-explorer.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { filter, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TuiRippleModule } from '@taiga-ui/addon-mobile';
import { MatIconModule } from '@angular/material/icon';
import { NgxVibrationModule } from 'ngx-vibration';
import { MealEmojisService } from './meal-emojis.service';
import {
	EmojiInputDialogComponent,
	EmojiInputDialogOutput,
} from './emoji-input-dialog/emoji-input-dialog.component';
import { RecipeModalService } from '../../../jow/recipe-modal/recipe-modal.service';
import {
	MealIdeasComponent,
	MealIdeasDialogOutput,
} from '../../../meal-ideas/meal-ideas.component';
import { MealIdeasService } from '../../../meal-ideas/meal-ideas.service';

@UntilDestroy()
@Component({
    selector: 'cb-meal-form',
    templateUrl: './meal-form.component.html',
    styleUrls: ['./meal-form.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        TuiGroupModule,
    ],
    providers: [MealEmojisService, RecipeModalService]
})
export class MealFormComponent implements OnChanges {
	constructor(
		private readonly mealQuery: MealQuery,
		private readonly mealService: MealService,
		private readonly cd: ChangeDetectorRef,
		private readonly emojisService: MealEmojisService,
		private readonly recipeModalService: RecipeModalService,
		private readonly mealIdeasService: MealIdeasService,
		@Inject(Injector) private readonly injector: Injector,
		@Inject(TuiDialogService) private readonly dialogs: TuiDialogService
	) {}

	@Input() meal: Meal | undefined;
	@Input() isReadonly = false;
	@Output() mealSaved = new EventEmitter<void>();

	readonly extrasFg = new FormGroup({
		outOfHome: new FormControl<boolean>(false, { nonNullable: true }),
		prepared: new FormControl<boolean>(false, { nonNullable: true }),
	});

	readonly form = new FormGroup({
		name: new FormControl<string | undefined>(undefined, { nonNullable: true }),
		memo: new FormControl<string | null>(null),
		extras: this.extrasFg,
		emojis: new FormControl<string[]>([], { nonNullable: true }),
	});

	nameSuggestions$ = this.mealQuery.nameSuggestions$;

	private readonly formEmojis$ = this.form.controls.emojis.valueChanges.pipe(
		startWith(this.form.controls.emojis.value),
		shareReplay({ bufferSize: 1, refCount: true })
	);

	readonly emojis$ = combineLatest([this.emojisService.popularEmojis$, this.formEmojis$]).pipe(
		map(([popularEmojis, selectedEmojis]) => {
			const popularEmojiCount = Math.max(
				0,
				this.emojisService.maxRecommendedEmojis - selectedEmojis.length
			);
			const allEmojis = [
				...selectedEmojis,
				...popularEmojis
					.filter((emoji) => !selectedEmojis.includes(emoji))
					.slice(0, popularEmojiCount + 1),
			];
			const slicedEmojis = allEmojis.slice(
				0,
				Math.max(selectedEmojis.length, this.emojisService.maxRecommendedEmojis)
			);

			return Array.from(new Set(slicedEmojis))
				.sort()
				.map((emoji) => ({
					emoji,
					isSelected: selectedEmojis.includes(emoji),
				}));
		})
	);

	jowRecipe: Recipe | null = null;

	readonly constructAssetUrl = constructAssetUrl;

	readonly mealIdeasAvailable = computed(
		() => !this.mealIdeasService.areIdeasLoading() && this.mealIdeasService.ideas().length > 0
	);

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
		// setTimeout is needed for the form initial value to be correctly detected by consumers
		// TODO: explore signals to avoid the need to rely on the OnChange hook
		setTimeout(() => {
			this.form.patchValue({
				name: this.meal?.name || '',
				extras: this.meal?.extras,
				memo: this.meal?.recipeMemo || null,
				emojis: this.meal?.emojis || [],
			});
		}, 0);
	}

	saveMeal() {
		const date = this.meal!.date;
		const type = this.meal!.type;
		const lines = this.meal?.lines || [];
		const emojis = this.form.value.emojis || [];

		const meal = {
			name: this.form.value.name,
			jowRecipe: this.jowRecipe,
			extras: this.extrasFg.value,
			recipeMemo: this.getRecipeMemo(),
			emojis,
			lines,
		} satisfies Partial<Meal>;

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

		const changedEmojis = emojis.filter((emoji) => !this.meal?.emojis?.includes(emoji));
		this.emojisService.setEmojisAsUsed(changedEmojis);

		this.mealSaved.emit();
	}

	openRecipeModal(recipe: Recipe) {
		const isRecipeSelected = !!(this.jowRecipe && this.jowRecipe._id === recipe._id);

		this.recipeModalService
			.openRecipeModal(recipe, isRecipeSelected)
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

	toggleEmoji(emoji: string) {
		const currentEmojis = this.form.controls.emojis.value;

		if (currentEmojis.includes(emoji)) {
			this.form.controls.emojis.setValue(currentEmojis.filter((e) => e !== emoji));
		} else {
			this.form.controls.emojis.setValue([...currentEmojis, emoji]);
		}
	}

	addEmoji() {
		this.dialogs
			.open<EmojiInputDialogOutput>(
				new PolymorpheusComponent(EmojiInputDialogComponent, this.injector)
			)
			.pipe(
				map((emoji) => emoji || null),
				filter(Boolean),
				tap((emoji) => {
					this.form.controls.emojis.setValue(
						Array.from(new Set([...this.form.controls.emojis.value, emoji]))
					);
					this.cd.detectChanges();
				}),
				untilDestroyed(this)
			)
			.subscribe();
	}

	openMealIdeasDialog() {
		this.dialogs
			.open<MealIdeasDialogOutput>(
				new PolymorpheusComponent(MealIdeasComponent, this.injector)
			)
			.pipe(
				map((emoji) => emoji || null),
				filter(Boolean),
				tap((mealIdea) => {
					this.form.controls.name.setValue(mealIdea.name);
				}),
				untilDestroyed(this)
			)
			.subscribe();
	}
}
