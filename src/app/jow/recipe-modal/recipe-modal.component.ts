import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Recipe } from '../../model/receipe';
import { JowService } from '../state/jow.service';
import { constructAssetUrl, constructRecipeUrl } from '../util';
import { TuiButtonModule, TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { CommonModule } from '@angular/common';
import { TuiLetModule } from '@taiga-ui/cdk';
import { MatIconModule } from '@angular/material/icon';

export interface RecipeModalData {
	recipe: Recipe;
	isSelected: boolean;
}

@Component({
	selector: 'cb-recipe-modal',
	templateUrl: './recipe-modal.component.html',
	styleUrls: ['./recipe-modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, TuiLetModule, MatIconModule, TuiButtonModule],
	standalone: true,
})
export class RecipeModalComponent {
	constructor(
		@Inject(POLYMORPHEUS_CONTEXT)
		private readonly context: TuiDialogContext<Recipe | undefined, RecipeModalData>,
		@Inject(JowService) public jowService: JowService
	) {}

	readonly data = this.context.data;

	protected readonly constructAssetUrl = constructAssetUrl;
	protected readonly constructRecipeUrl = constructRecipeUrl;

	addToMeal() {
		this.context.completeWith(this.data.recipe);
	}
}
