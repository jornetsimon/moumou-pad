import { Inject, Injectable, Injector } from '@angular/core';
import { Recipe } from '@functions/model/receipe.model';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RecipeModalComponent } from './recipe-modal.component';
import { TuiDialogService } from '@taiga-ui/core';

@Injectable()
export class RecipeModalService {
	constructor(
		@Inject(Injector) private readonly injector: Injector,
		@Inject(TuiDialogService) private readonly dialogs: TuiDialogService
	) {}

	openRecipeModal(recipe: Recipe, isSelected: boolean) {
		return this.dialogs.open<Recipe | undefined>(
			new PolymorpheusComponent(RecipeModalComponent, this.injector),
			{
				data: {
					recipe,
					isSelected,
				},
			}
		);
	}
}
