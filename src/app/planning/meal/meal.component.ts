import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	ViewChild,
} from '@angular/core';
import { Meal } from './state/meal.model';
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
import { map } from 'rxjs/operators';
import { interval, merge, Observable, Subject } from 'rxjs';
import { NgxVibrationService } from 'ngx-vibration';

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
export class MealComponent {
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
	private _meal!: Meal;
	mealSubject = new Subject<Meal>();
	editMode = false;
	isNext = false;
	cannotDropHere$: Observable<boolean> = this.dragDropService.dragging$.pipe(
		map((dragging) => {
			if (!dragging || !this.dropListRef) {
				return false;
			}
			return !this.canEnter({ data: dragging } as CdkDrag<Meal>, this.dropListRef);
		})
	);
	isNext$ = merge(interval(60 * 60 * 1000), this.mealSubject.asObservable()).pipe(
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
		private cd: ChangeDetectorRef,
		public dragDropService: DragDropService,
		private dialog: MatDialog,
		private vibrationService: NgxVibrationService
	) {}

	toggleEdit() {
		this.editMode = !this.editMode;
		this.cd.detectChanges();
		if (this.containerRef) {
			setTimeout(() => {
				this.containerRef!.nativeElement.scrollIntoView({ behavior: 'smooth' });
			}, 250);
		}
	}

	afterSave() {
		this.toastService.success(`Repas enregistré`, { duration: 4000 });
		this.editMode = false;
		this.cd.detectChanges();
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
