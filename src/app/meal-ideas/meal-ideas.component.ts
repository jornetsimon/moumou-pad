import { ChangeDetectionStrategy, Component, computed, Inject } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MealIdeasService } from './meal-ideas.service';
import { NgStyle } from '@angular/common';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiButtonModule, TuiDialogContext, TuiGroupModule } from '@taiga-ui/core';
import {
	TuiCardModule,
	TuiCellModule,
	TuiHeaderModule,
	TuiSurfaceModule,
	TuiTitleModule,
} from '@taiga-ui/experimental';
import { UrlPreviewPipe } from '../shared/url-preview.pipe';
import { TuiTagModule } from '@taiga-ui/kit';
import { ToReadableTextColorPipe } from '../../utils/pipes/to-readable-text-color.pipe';
import { TuiRepeatTimesModule } from '@taiga-ui/cdk';

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
		UrlPreviewPipe,
		TuiTagModule,
		ToReadableTextColorPipe,
		TuiRepeatTimesModule,
		TuiGroupModule,
		TuiButtonModule,
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
	) {}

	readonly ideas = computed(() =>
		this.ideasService
			.ideas()
			.map((idea) => ({ ...idea, absoluteRating: Math.abs(idea.rating) }))
	);
}
