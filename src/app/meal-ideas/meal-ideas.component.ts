import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MealIdeasService } from './meal-ideas.service';
import { NgStyle } from '@angular/common';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import {
	TuiCardModule,
	TuiCellModule,
	TuiHeaderModule,
	TuiSurfaceModule,
	TuiTitleModule,
} from '@taiga-ui/experimental';

export type MealIdeasDialogOutput = string | null;

@UntilDestroy()
@Component({
	selector: 'cb-meal-ideas',
	standalone: true,
	imports: [
		TuiCardModule,
		TuiHeaderModule,
		TuiSurfaceModule,
		TuiTitleModule,
		NgStyle,
		TuiCellModule,
	],
	templateUrl: './meal-ideas.component.html',
	styleUrl: './meal-ideas.component.less',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealIdeasComponent {
	constructor(
		@Inject(POLYMORPHEUS_CONTEXT)
		private readonly context: TuiDialogContext<MealIdeasDialogOutput, void>,
		private readonly ideasService: MealIdeasService
	) {
		this.ideasService.fetchIdeas();
	}

	readonly ideas = this.ideasService.ideas;
}
