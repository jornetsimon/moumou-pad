import { Component, Inject } from '@angular/core';
import { Meal } from '../state/meal.model';
import { constructAssetUrl } from '../../../jow/util';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { TuiSwipe, TuiSwipeModule } from '@taiga-ui/cdk';
import { CommonModule } from '@angular/common';
import { TuiButtonModule, TuiChipModule, TuiIconModule } from '@taiga-ui/experimental';
import { TuiRippleModule } from '@taiga-ui/addon-mobile';
import { TuiIslandModule } from '@taiga-ui/kit';
import { MatIconModule } from '@angular/material/icon';

export interface MealSwapDialogData {
	from: Meal;
	to: Meal;
}

@Component({
    selector: 'cb-meal-swap-dialog',
    templateUrl: './meal-swap-dialog.component.html',
    styleUrls: ['./meal-swap-dialog.component.less'],
    imports: [
        CommonModule,
        TuiButtonModule,
        TuiChipModule,
        TuiSwipeModule,
        TuiRippleModule,
        TuiIslandModule,
        TuiIconModule,
        MatIconModule,
    ]
})
export class MealSwapDialogComponent {
	constructor(
		@Inject(POLYMORPHEUS_CONTEXT)
		private readonly context: TuiDialogContext<boolean, MealSwapDialogData>
	) {}

	readonly data = this.context.data;

	protected readonly constructAssetUrl = constructAssetUrl;

	cancel() {
		this.context.completeWith(false);
	}

	swap() {
		this.context.completeWith(true);
	}

	onSwipe(swipeEvent: TuiSwipe) {
		if (swipeEvent.direction === 'bottom') {
			this.cancel();
		}
	}
}
