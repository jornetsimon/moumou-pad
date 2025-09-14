import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HotToastService } from '@ngxpert/hot-toast';
import { TuiRippleModule } from '@taiga-ui/addon-mobile';
import { TuiSwipe, TuiSwipeModule } from '@taiga-ui/cdk';
import { TuiDialogContext, TuiLoaderModule } from '@taiga-ui/core';
import { TuiButtonModule, TuiChipModule, TuiIconModule } from '@taiga-ui/experimental';
import { TuiIslandModule } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { constructAssetUrl } from '../../../jow/util';
import { Meal } from '../state/meal.model';
import { MealService } from '../state/meal.service';

export interface MealRescheduleDialogData {
	meal: Meal;
}

@Component({
	selector: 'cb-meal-reschedule-dialog',
	templateUrl: './meal-reschedule-dialog.component.html',
	styleUrls: ['./meal-reschedule-dialog.component.less'],
	imports: [
		CommonModule,
		TuiButtonModule,
		TuiChipModule,
		TuiSwipeModule,
		TuiRippleModule,
		TuiIslandModule,
		TuiIconModule,
		MatIconModule,
		TuiLoaderModule,
	],
})
export class MealRescheduleDialogComponent {
	constructor(
		@Inject(POLYMORPHEUS_CONTEXT)
		private readonly context: TuiDialogContext<boolean, MealRescheduleDialogData>,
		private readonly mealService: MealService,
		private readonly toastService: HotToastService
	) {}

	readonly data = this.context.data;

	protected readonly constructAssetUrl = constructAssetUrl;

	readonly loading = signal(false);

	readonly nextSlot = this.mealService.getFirstAvailableSlotInNextWeek(this.data.meal);

	cancel() {
		if (this.loading()) {
			return;
		}
		this.context.completeWith(false);
	}

	async confirm() {
		if (this.loading()) {
			return;
		}

		this.loading.set(true);
		try {
			if (!this.nextSlot) {
				this.toastService.error('Aucun créneau libre la semaine prochaine');
				return;
			}
			await this.mealService.moveMealTo(this.data.meal, this.nextSlot);
			this.toastService.success('Repas reporté à la semaine prochaine');
			this.context.completeWith(true);
		} catch (error) {
			console.error(error);
			this.toastService.error('Erreur lors du report du repas');
		} finally {
			this.loading.set(false);
		}
	}

	onSwipe(swipeEvent: TuiSwipe) {
		if (this.loading()) {
			return;
		}

		if (swipeEvent.direction === 'bottom') {
			this.cancel();
		}
	}
}
