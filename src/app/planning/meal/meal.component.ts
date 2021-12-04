import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	TrackByFunction,
	ViewChild,
} from '@angular/core';
import { Dish, Meal } from './state/meal.model';
import { MealQuery } from './state/meal.query';
import { collapseOnLeaveAnimation, expandOnEnterAnimation } from 'angular-animations';
import { JowService } from '../../jow/state/jow.service';
import { getHours, isSameDay } from 'date-fns';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { MealService } from './state/meal.service';
import { HotToastService } from '@ngneat/hot-toast';
import { CdkDrag } from '@angular/cdk/drag-drop/directives/drag';
import { DragDropService } from './drag-drop.service';
import { MatDialog } from '@angular/material/dialog';
import { MealSwapDialogComponent } from './meal-swap-dialog/meal-swap-dialog.component';
import { delay, distinctUntilChanged, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, interval, merge, Observable } from 'rxjs';
import { NgxVibrationService } from 'ngx-vibration';
import { MealThemeModel } from './theme/meal-theme.model';
import { isNotNullOrUndefined, sanitizeString, stringContainsEmoji } from '../../shared/utilities';
import * as tinycolor from 'tinycolor2';
import { MealThemeService } from './theme/meal-theme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
	selector: 'cb-meal',
	templateUrl: './meal.component.html',
	styleUrls: ['./meal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		collapseOnLeaveAnimation({
			duration: 250,
		}),
		expandOnEnterAnimation({
			duration: 400,
		}),
	],
})
export class MealComponent implements AfterViewInit {
	@Input() set meal(meal: Meal) {
		this._meal = meal;
		this.mealSubject.next(meal);
	}
	get meal(): Meal {
		return this._meal;
	}
	@ViewChild('container') containerRef: ElementRef | undefined;
	@ViewChild('dropListRef') dropListRef: CdkDropList<Meal> | undefined;
	@Output() mealSaved = new EventEmitter<HTMLDivElement>();
	@Output() isNext = new EventEmitter<HTMLDivElement>();

	private _meal!: Meal;
	private mealSubject = new BehaviorSubject<Meal | undefined>(undefined);
	meal$: Observable<Meal> = this.mealSubject.asObservable().pipe(filter(isNotNullOrUndefined));
	editMode = false;
	editMode$ = this.route.fragment.pipe(
		map((fragment) => fragment === this.meal.id),
		distinctUntilChanged(),
		tap((editMode) => {
			if (editMode && this.containerRef) {
				setTimeout(() => {
					this.containerRef!.nativeElement.scrollIntoView({ behavior: 'smooth' });
				}, 250);
			}
		})
	);
	cannotDropHere$: Observable<boolean> = this.dragDropService.dragging$.pipe(
		map((dragging) => {
			if (!dragging || !this.dropListRef) {
				return false;
			}
			return !this.canEnter({ data: dragging } as CdkDrag<Meal>, this.dropListRef);
		})
	);
	isNext$ = merge(interval(60 * 60 * 1000), this.meal$).pipe(
		map(() => {
			const now = Date.now();
			const isMealToday = isSameDay(this.meal.date, now);
			const currentHour = getHours(now);
			if (isMealToday) {
				const matchesLunch = currentHour < 14 && this.meal.type === 'lunch';
				const matchesDinner = currentHour >= 14 && this.meal.type === 'dinner';
				return matchesLunch || matchesDinner;
			}
			return false;
		})
	);
	headers$: Observable<Dish[]> = this.meal$.pipe(
		map(
			(meal) =>
				[
					{ name: meal.name, jowRecipe: meal.jowRecipe },
					meal.alternateDish?.name ? meal.alternateDish : undefined,
				].filter(Boolean) as Dish[]
		)
	);
	mealTheme$: Observable<MealThemeModel | undefined> = combineLatest([
		this.meal$,
		this.mealThemeService.mealThemes$,
	]).pipe(
		map(([meal, themes]): MealThemeModel | undefined => {
			const name = sanitizeString(meal.name || '');
			const matchedThemeIndex = themes.findIndex((themeEntry) =>
				themeEntry.keywords.some((keyword) => name.includes(sanitizeString(keyword)))
			);
			if (!(matchedThemeIndex >= 0)) {
				return undefined;
			}
			return themes[matchedThemeIndex].theme;
		})
	);
	themeBoxShadow$ = this.mealTheme$.pipe(
		map((theme) =>
			theme?.color && theme.shadow
				? `0px 0px 11px 2px ${tinycolor(theme.color)
						.setAlpha(theme.backgroundImage ? 1 : 0.5)
						.toRgbString()}`
				: undefined
		)
	);
	themeBackgroundImage$: Observable<string> = this.mealTheme$.pipe(
		withLatestFrom(this.meal$),
		map(([theme, meal]) => {
			let url;
			if (meal.jowRecipe?.imageUrl) {
				url = this.jowService.constructAssetUrl(meal.jowRecipe!.imageUrl);
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

	trackByIndex: TrackByFunction<Dish> = (index) => index;

	canEnter = (drag: CdkDrag<Meal>, drop: CdkDropList<Meal>): boolean => {
		const origin = drag.data;
		const destination = drop.data;
		if (drop.data.id === 'cancel') {
			return true;
		}
		return !!origin.name || !!destination.name;
	};

	constructor(
		private mealQuery: MealQuery,
		private mealService: MealService,
		private toastService: HotToastService,
		public jowService: JowService,
		public dragDropService: DragDropService,
		private dialog: MatDialog,
		private vibrationService: NgxVibrationService,
		private mealThemeService: MealThemeService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	ngAfterViewInit() {
		this.isNext$
			.pipe(
				distinctUntilChanged(),
				filter((isNext) => isNext),
				delay(1200),
				untilDestroyed(this)
			)
			.subscribe(() => {
				this.isNext.emit(this.containerRef?.nativeElement);
			});
	}

	toggleEdit(setTo?: boolean) {
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

		const dialogRef = this.dialog.open(MealSwapDialogComponent, {
			data: { from: originMeal, to: destinationMeal },
			panelClass: 'meal-swap-dialog',
		});

		dialogRef.afterClosed().subscribe((confirm: boolean | undefined) => {
			if (confirm) {
				this.mealService.swapMeals(originMeal, destinationMeal).then(
					() => {
						this.toastService.success('Menus échangés');
					},
					(error) => {
						console.error(error);
						this.toastService.error(`Erreur lors de l'échange de repas`);
					}
				);
			}
		});
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
}
