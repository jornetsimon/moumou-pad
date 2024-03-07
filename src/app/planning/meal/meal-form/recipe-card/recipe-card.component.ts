import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { TuiButtonModule, TuiHintModule } from '@taiga-ui/core';
import { Recipe } from '../../../../model/receipe';
import { constructAssetUrl } from '../../../../jow/util';
import { TuiRippleModule } from '@taiga-ui/addon-mobile';

@UntilDestroy()
@Component({
	selector: 'cb-recipe-card',
	standalone: true,
	imports: [
		MatIconModule,
		NgIf,
		TuiButtonModule,
		TuiHintModule,
		NgOptimizedImage,
		TuiRippleModule,
	],
	templateUrl: './recipe-card.component.html',
	styleUrl: './recipe-card.component.less',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeCardComponent {
	@Input({ required: true }) jowRecipe!: Recipe;
	@Input() isReadonly = false;

	@Output() openRecipeModal = new EventEmitter<void>();
	@Output() removeRecipe = new EventEmitter<void>();

	readonly constructAssetUrl = constructAssetUrl;
}
