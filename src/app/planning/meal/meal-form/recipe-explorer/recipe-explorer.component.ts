import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { constructAssetUrl } from '../../../../jow/util';
import { TuiDataListWrapperModule, TuiInputModule, TuiIslandModule } from '@taiga-ui/kit';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
	TuiDataListModule,
	TuiLoaderModule,
	TuiSvgModule,
	TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import {
	debounceTime,
	distinctUntilChanged,
	filter,
	map,
	shareReplay,
	startWith,
	switchMap,
	tap,
} from 'rxjs/operators';
import { Recipe } from '../../../../model/receipe';
import { shuffle } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { JowQuery } from '../../../../jow/state/jow.query';
import { MealQuery } from '../../state/meal.query';
import { JowService } from '../../../../jow/state/jow.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TuiLetModule } from '@taiga-ui/cdk';
import { TuiChipModule } from '@taiga-ui/experimental';
import { distinctUntilArrayChanged } from '../../../../../utils/distinct-until-array-changed';
import { ToReadableTextColorPipe } from '../../../../../utils/pipes/to-readable-text-color.pipe';

@Component({
    selector: 'cb-recipe-explorer',
    imports: [
        CommonModule,
        TuiInputModule,
        ReactiveFormsModule,
        TuiTextfieldControllerModule,
        TuiDataListWrapperModule,
        AsyncPipe,
        TuiDataListModule,
        TuiSvgModule,
        TuiLoaderModule,
        TuiIslandModule,
        TuiLetModule,
        TuiChipModule,
        ToReadableTextColorPipe,
    ],
    templateUrl: './recipe-explorer.component.html',
    styleUrl: './recipe-explorer.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeExplorerComponent {
	constructor(
		private readonly jowQuery: JowQuery,
		private readonly mealQuery: MealQuery,
		private readonly jowService: JowService
	) {}

	@Output() selectRecipe = new EventEmitter<Recipe>();
	@Output() openRecipeModal = new EventEmitter<Recipe>();

	readonly searchCtrl = new FormControl<string | undefined>(undefined, { nonNullable: true });

	readonly alreadyUsedRecipeSuggestions$ = this.mealQuery.mostUsedRecipes$.pipe(
		distinctUntilArrayChanged(),
		map((recipes): Array<Recipe & { useCount: number }> => shuffle(recipes).slice(0, 3)),
		shareReplay({ bufferSize: 1, refCount: true })
	);

	readonly recipeIdeas$ = combineLatest([
		this.jowQuery
			.select('featured')
			.pipe(filter((featuredRecipes) => !!featuredRecipes.length)),
		this.alreadyUsedRecipeSuggestions$,
	]).pipe(
		distinctUntilArrayChanged(),
		map(([featuredRecipes, alreadyUsedRecipeSuggestions]): Recipe[] =>
			shuffle(
				featuredRecipes.filter(
					(recipe) => !alreadyUsedRecipeSuggestions.find((r) => r._id === recipe._id)
				)
			).splice(0, 2)
		)
	);

	private readonly isLoadingSearchResults$$ = new BehaviorSubject(false);
	readonly isLoadingSearchResults$ = this.isLoadingSearchResults$$.pipe(distinctUntilChanged());

	readonly recipeSearchResults$: Observable<Recipe[]> = this.searchCtrl.valueChanges.pipe(
		startWith(this.searchCtrl.value),
		filter((term) => typeof term === 'string'),
		tap(() => {
			this.isLoadingSearchResults$$.next(true);
		}),
		debounceTime(300),
		switchMap((term) => (term ? this.jowService.search(term) : of([]))),
		tap(() => {
			this.isLoadingSearchResults$$.next(false);
		})
	);

	readonly emptyContent$ = combineLatest([
		this.searchCtrl.valueChanges.pipe(startWith(this.searchCtrl.value)),
		this.isLoadingSearchResults$,
	]).pipe(
		map(([searchTerm, isLoading]) => {
			if (!searchTerm) {
				return 'Entrer un mot-clé pour lancer la recherche';
			}
			if (isLoading || !searchTerm) {
				return 'Recherche en cours';
			}
			return 'Aucun résultat';
		})
	);

	protected readonly constructAssetUrl = constructAssetUrl;
}
