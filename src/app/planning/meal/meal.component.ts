import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	SimpleChanges,
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
export class MealComponent implements OnChanges {
	@Input() meal!: Meal;
	@ViewChild('container') containerRef: ElementRef | undefined;
	private showIsBeingDragged = new EventEmitter<boolean>();
	showIsBeingDragged$ = this.showIsBeingDragged.asObservable();
	editMode = false;
	isNext = false;

	canEnter = (drag: CdkDrag<Meal>, drop: CdkDropList<Meal>): boolean => {
		const origin = drag.data;
		const destination = drop.data;
		return !!origin.name || !!destination.name;
	};

	constructor(
		private mealQuery: MealQuery,
		private mealService: MealService,
		private toastService: HotToastService,
		public jowService: JowService,
		private cd: ChangeDetectorRef,
		public dragDropService: DragDropService,
		private dialog: MatDialog
	) {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.meal) {
			const now = Date.now();
			const isToday = isSameDay(this.meal.date, now);
			const currentHour = getHours(now);
			if (isToday) {
				const matchesLunch = currentHour < 14 && this.meal.type === 'lunch';
				const matchesDinner = currentHour >= 14 && this.meal.type === 'dinner';
				this.isNext = matchesLunch || matchesDinner;
			}
		}
	}

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
		this.showIsBeingDragged.emit(true);
		this.dragDropService.dragStart();
	}

	onDragEnd() {
		this.showIsBeingDragged.emit(false);
		this.dragDropService.dragStop();
	}
}
