import {
	ChangeDetectionStrategy,
	Component,
	computed,
	EventEmitter,
	input,
	Input,
	Output,
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgStyle } from '@angular/common';
import { TuiButtonModule, TuiHintModule } from '@taiga-ui/core';
import { Recipe } from '../../../../model/receipe';
import { constructAssetUrl } from '../../../../jow/util';
import { TuiRippleModule } from '@taiga-ui/addon-mobile';
import { TuiLetModule } from '@taiga-ui/cdk';
import { transparentize } from 'color2k';

@UntilDestroy()
@Component({
    selector: 'cb-recipe-card',
    imports: [
    MatIconModule,
    NgIf,
    TuiButtonModule,
    TuiHintModule,
    TuiRippleModule,
    TuiLetModule,
    NgStyle
],
    templateUrl: './recipe-card.component.html',
    styleUrl: './recipe-card.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeCardComponent {
	readonly jowRecipe = input.required<Recipe>();
	@Input() isReadonly = false;

	@Output() openRecipeModal = new EventEmitter<void>();
	@Output() removeRecipe = new EventEmitter<void>();

	readonly constructAssetUrl = constructAssetUrl;

	readonly circlesShadow = computed(() => {
		const color = this.jowRecipe().smartColor;
		const shade1 = transparentize(color, 0.75);
		const shade2 = transparentize(color, 0.8);
		const shade3 = transparentize(color, 0.9);
		return `0px 0px 0px 1px ${shade1}, 0px 0px 0px 27px #fff, 0px 0px 2px 28px ${shade2}, 0px 0px 0px 60px #fff, 0px 0px 2px 61px ${shade3}`;
	});
}
