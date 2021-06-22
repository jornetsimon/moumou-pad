import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { Meal } from './state/meal.model';
import { MealQuery } from './state/meal.query';
import { MatSnackBar } from '@angular/material/snack-bar';
import { collapseOnLeaveAnimation, expandOnEnterAnimation } from 'angular-animations';
import { JowService } from '../../jow/state/jow.service';
import { getHours, isSameDay } from 'date-fns';

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
			duration: 500,
		}),
	],
})
export class MealComponent implements OnChanges {
	@Input() meal!: Meal;
	@ViewChild('container') containerRef: ElementRef | undefined;
	editMode = false;
	isNext = false;

	constructor(
		private mealQuery: MealQuery,
		private snackBar: MatSnackBar,
		public jowService: JowService,
		private cd: ChangeDetectorRef
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
		this.snackBar.open(`Repas enregistré`, undefined, { duration: 4000 });
		this.editMode = false;
		this.cd.detectChanges();
	}
}
