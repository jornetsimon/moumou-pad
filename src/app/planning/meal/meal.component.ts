import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	ElementRef,
	EventEmitter,
	Inject,
	Injector,
	Input,
	OnInit,
	Output,
	signal,
	ViewChild,
} from '@angular/core';
import { isNextMeal, Meal } from './state/meal.model';
import { collapseOnLeaveAnimation, expandOnEnterAnimation } from 'angular-animations';
import { MealService } from './state/meal.service';
import { HotToastService } from '@ngneat/hot-toast';
import { DragDropService } from './drag-drop.service';
import {
	delay,
	distinctUntilChanged,
	filter,
	map,
	switchMap,
	tap,
	withLatestFrom,
} from 'rxjs/operators';
import { BehaviorSubject, combineLatest, interval, merge, Observable } from 'rxjs';
import { MealThemeModel } from './theme/meal-theme.model';
import { isNotNullOrUndefined, sanitizeString, stringContainsEmoji } from '../../shared/utilities';
import { MealThemeService } from './theme/meal-theme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgxVibrationModule, NgxVibrationService } from 'ngx-vibration';
import { TuiAccordionModule, TuiIslandModule } from '@taiga-ui/kit';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
	TuiDataListModule,
	TuiDialogService,
	TuiHintModule,
	TuiHostedDropdownModule,
} from '@taiga-ui/core';
import {
	CdkDrag,
	CdkDragDrop,
	CdkDropList,
	DragDropModule,
	moveItemInArray,
} from '@angular/cdk/drag-drop';
import { TuiRippleModule } from '@taiga-ui/addon-mobile';
import { MealFormComponent } from './meal-form/meal-form.component';
import { constructAssetUrl } from '../../jow/util';
import { TuiButtonModule, TuiIconModule, TuiSurfaceModule } from '@taiga-ui/experimental';
import { MealSwapDialogComponent } from './meal-swap-dialog/meal-swap-dialog.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiLetModule } from '@taiga-ui/cdk';
import { MealLine } from '@functions/model/meal.model';
import { RecipeModalService } from '../../jow/recipe-modal/recipe-modal.service';
import { Recipe } from '@functions/model/receipe.model';
import { MealLineInputDialogComponent } from './meal-line-input-dialog/meal-line-input-dialog.component';
import { ToReadableTextColorPipe } from '../../../utils/pipes/to-readable-text-color.pipe';
import { pickBy } from 'lodash-es';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toRgba, transparentize } from 'color2k';

@UntilDestroy()
@Component({
	selector: 'cb-meal',
	templateUrl: './meal.component.html',
	styleUrls: ['./meal.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	animations: [
		collapseOnLeaveAnimation({
			duration: 250,
		}),
		expandOnEnterAnimation({
			duration: 400,
		}),
	],
	imports: [
		CommonModule,
		TuiAccordionModule,
		MatIconModule,
		TuiHintModule,
		TuiButtonModule,
		NgxVibrationModule,
		TuiIslandModule,
		TuiRippleModule,
		MealFormComponent,
		TuiSurfaceModule,
		DragDropModule,
		TuiLetModule,
		TuiButtonModule,
		TuiHostedDropdownModule,
		TuiDataListModule,
		TuiIconModule,
		ToReadableTextColorPipe,
	],
	providers: [RecipeModalService],
})
export class MealComponent implements OnInit, AfterViewInit {
	constructor(
		private readonly mealService: MealService,
		private readonly toastService: HotToastService,
		public readonly dragDropService: DragDropService,
		private readonly vibrationService: NgxVibrationService,
		private readonly mealThemeService: MealThemeService,
		private readonly router: Router,
		private readonly route: ActivatedRoute,
		private readonly recipeModalService: RecipeModalService,
		private readonly destroyRef: DestroyRef,
		private readonly breakpointObserver: BreakpointObserver,
		@Inject(Injector) private readonly injector: Injector,
		@Inject(TuiDialogService) private readonly dialogs: TuiDialogService
	) {}

	@Input() set meal(meal: Meal) {
		this._meal = meal;
		this.meal$$.next(meal);
	}
	get meal(): Meal {
		return this._meal;
	}
	@Input() hasMargins = false;
	@Input() showFullDateInTopper = false;
	@Input() isReadonly = false;
	@ViewChild('container') containerRef: ElementRef<HTMLDivElement> | undefined;
	@ViewChild('dropListRef') dropListRef: CdkDropList<Meal> | undefined;
	@Output() mealSaved = new EventEmitter<HTMLDivElement>();
	@Output() isNext = new EventEmitter<HTMLDivElement>();

	private _meal!: Meal;
	private meal$$ = new BehaviorSubject<Meal | undefined>(undefined);
	meal$: Observable<Meal> = this.meal$$.asObservable().pipe(filter(isNotNullOrUndefined));
	readonly isEditMode = signal(false);
	cannotDropHere$: Observable<boolean> = this.dragDropService.dragging$.pipe(
		map((dragging) => {
			if (!dragging || !this.dropListRef) {
				return false;
			}
			return !this.canEnter({ data: dragging } as CdkDrag<Meal>, this.dropListRef);
		})
	);
	isNext$ = merge(interval(60 * 60 * 1000), this.meal$).pipe(map(() => isNextMeal(this.meal)));
	mealTheme$: Observable<MealThemeModel | undefined> = combineLatest([
		this.meal$,
		this.mealThemeService.mealThemes$,
	]).pipe(
		map(([meal, themes]): MealThemeModel | undefined => {
			const keywordsToCheck = [
				sanitizeString(meal.name || ''),
				...(meal.lines?.map(({ text }) => text) ?? []),
			];

			const matchedThemeIndex = themes.findIndex((themeEntry) =>
				themeEntry.keywords.some((keyword) =>
					keywordsToCheck.some((k) => sanitizeString(k).includes(sanitizeString(keyword)))
				)
			);
			if (!(matchedThemeIndex >= 0)) {
				return undefined;
			}
			return themes[matchedThemeIndex].theme;
		})
	);
	// TODO: fix where the shadow is applied
	// It got broken with the tui-swipe-actions
	themeBoxShadow$ = this.mealTheme$.pipe(
		map((theme) => {
			if (!(theme?.color && theme.shadow)) {
				return undefined;
			}

			const color = transparentize(theme.color, theme.backgroundImage ? 0 : 0.5);
			return `0px 0px 11px 2px ${toRgba(color)}`;
		})
	);
	themeBackgroundImage$: Observable<string> = this.mealTheme$.pipe(
		withLatestFrom(this.meal$),
		map(([theme, meal]) => {
			let url;
			if (meal.jowRecipe?.imageUrl) {
				url = constructAssetUrl(meal.jowRecipe!.imageUrl);
			} else {
				if (theme?.backgroundImage) {
					url = theme.backgroundImage;
				}
			}
			return url ? `url('${url}')` : '';
		})
	);
	themeEmoji$: Observable<string> = this.mealTheme$.pipe(
		withLatestFrom(this.meal$),
		map(([theme, meal]) => {
			if (meal?.name && stringContainsEmoji(meal.name)) {
				return '';
			}
			return theme?.emoji || '';
		})
	);

	readonly mealColor$: Observable<string> = combineLatest([this.meal$, this.mealTheme$]).pipe(
		map(([meal, theme]) => {
			if (meal.jowRecipe?.smartColor) {
				return meal.jowRecipe.smartColor;
			}

			if (theme?.color) {
				return theme.color;
			}

			if (meal.extras?.outOfHome) {
				return '#ff4081';
			}

			if (meal.name) {
				return 'var(--tui-primary)';
			}

			return 'var(--tui-base-04)';
		})
	);

	readonly lines$: Observable<MealLine[]> = this.meal$.pipe(map((meal) => meal.lines || []));

	readonly isPointerDevice$ = this.breakpointObserver.observe('(pointer: fine)').pipe(
		map((result) => result.matches),
		distinctUntilChanged()
	);

	canEnter = (drag: CdkDrag<Meal>, drop: CdkDropList<Meal>): boolean => {
		const origin = drag.data;
		const destination = drop.data;
		if (drop.data.id === 'cancel') {
			return true;
		}
		return !!origin.name || !!destination.name;
	};

	ngOnInit() {
		this.setEditModeFromRoute().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
	}

	ngAfterViewInit() {
		this.isNext$
			.pipe(
				distinctUntilChanged(),
				filter((isNext) => isNext),
				delay(500),
				//filter(() => environment.production),
				untilDestroyed(this)
			)
			.subscribe(() => {
				this.isNext.emit(this.containerRef?.nativeElement);
			});
	}

	toggleEdit(setTo?: boolean) {
		if (this.isReadonly) {
			this.isEditMode.update((value) => (setTo !== undefined ? setTo : !value));
			return;
		}
		let newFragment: string | undefined;
		if (setTo !== undefined) {
			newFragment = setTo ? this.meal.id : undefined;
		} else {
			newFragment = this.route.snapshot.fragment === this.meal.id ? undefined : this.meal.id;
		}
		this.router.navigate([], {
			fragment: newFragment,
		});
	}

	afterSave() {
		this.toastService.success(`Repas enregistré`, { duration: 4000 });
		this.toggleEdit(false);
		this.mealSaved.emit(this.containerRef?.nativeElement);
	}

	/**
	 * When a day is dropped on another
	 */
	onDrop(drop: CdkDragDrop<Meal, any>) {
		this.dragDropService.dragStop();

		const originMeal: Meal = drop.item.data;
		const destinationMeal: Meal = drop.container.data;

		if (originMeal.id === destinationMeal.id) {
			return;
		}

		this.dialogs
			.open<boolean>(new PolymorpheusComponent(MealSwapDialogComponent, this.injector), {
				data: { from: originMeal, to: destinationMeal },
			})
			.pipe(
				filter(Boolean),
				switchMap(() =>
					this.mealService.swapMeals(originMeal, destinationMeal).then(
						() => {
							this.toastService.success('Menus échangés');
						},
						(error) => {
							console.error(error);
							this.toastService.error(`Erreur lors de l'échange de repas`);
						}
					)
				),
				untilDestroyed(this)
			)
			.subscribe();
	}

	onDragStart() {
		this.dragDropService.dragStart(this.meal);
	}

	onDragEnd() {
		this.dragDropService.dragStop();
	}

	onEnter() {
		this.vibrationService.vibrate([25]);
	}

	openRecipeDialog(recipe: Recipe) {
		this.recipeModalService
			.openRecipeModal(recipe, false)
			.pipe(untilDestroyed(this))
			.subscribe();
	}

	openMealLineDialog(event?: MouseEvent) {
		this.vibrationService.vibrate([15, 50, 15]);

		if (event) {
			const target = event.target as HTMLElement;
			target.blur();
		}

		this.dialogs
			.open<MealLine | null>(
				new PolymorpheusComponent(MealLineInputDialogComponent, this.injector)
			)
			.pipe(
				tap((mealLine) => {
					if (!mealLine) {
						return;
					}

					const meal = this.meal;
					const lines = [...(meal.lines || []), mealLine];

					this.mealService.update(this.meal.id, {
						...pickBy(meal, (p) => p !== undefined),
						lines,
					});
				}),
				untilDestroyed(this)
			)
			.subscribe();
	}

	removeLine(index: number) {
		const lines = [...(this.meal.lines || [])];
		lines.splice(index, 1);
		this.mealService.update(this.meal.id, { lines });
	}

	private setEditModeFromRoute() {
		return this.route.fragment.pipe(
			map((fragment) => fragment === this.meal.id),
			distinctUntilChanged(),
			tap((editingCurrentMeal) => this.isEditMode.set(editingCurrentMeal)),
			filter(Boolean),
			tap(() => {
				if (!this.containerRef) {
					return;
				}
				const element = this.containerRef.nativeElement;
				const offset = 120;

				setTimeout(() => {
					window.scrollTo({
						behavior: 'smooth',
						top:
							element.getBoundingClientRect().top -
							document.body.getBoundingClientRect().top -
							offset,
					});
				}, 250);
			})
		);
	}

	lineReordered(event: CdkDragDrop<MealLine[], any>) {
		console.log('reorder', event);
		const lines = [...(this.meal.lines || [])];
		moveItemInArray(lines, event.previousIndex, event.currentIndex);
		this.meal.lines = lines;

		const meal = this.meal;
		this.mealService.update(meal.id, {
			...pickBy(meal, (p) => p !== undefined),
			lines: this.meal.lines,
		});
	}
}
