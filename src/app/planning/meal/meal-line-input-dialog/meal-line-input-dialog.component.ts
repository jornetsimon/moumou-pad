import { Component, Inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAutoFocusModule } from '@taiga-ui/cdk';
import {
	TuiButtonModule,
	TuiDialogContext,
	TuiErrorModule,
	TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { TuiFieldErrorPipeModule, TuiInputModule, TuiTextareaModule } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { MealLine } from '@functions/model/meal.model';
import { MealEmojisService } from '../meal-form/meal-emojis.service';

@Component({
	selector: 'cb-meal-line-input-dialog',
	standalone: true,
	imports: [
		AsyncPipe,
		TuiAutoFocusModule,
		TuiErrorModule,
		TuiFieldErrorPipeModule,
		TuiInputModule,
		TuiTextareaModule,
		TuiTextfieldControllerModule,
		ReactiveFormsModule,
		TuiButtonModule,
	],
	templateUrl: './meal-line-input-dialog.component.html',
	styleUrl: './meal-line-input-dialog.component.less',
})
export class MealLineInputDialogComponent {
	constructor(
		@Inject(POLYMORPHEUS_CONTEXT)
		private readonly context: TuiDialogContext<MealLine | null, void>
	) {}

	readonly control = new FormControl<string>('', {
		nonNullable: true,
		validators: [Validators.required],
	});

	save() {
		if (this.control.invalid) {
			return;
		}

		const value = this.control.value.trim();

		if (!value) {
			this.context.completeWith(null);
			return;
		}

		const allEmojisPattern = new RegExp(`${MealEmojisService.emojiRegex.source}`, 'gu');
		const emojisMatches = value.match(allEmojisPattern);

		if (!emojisMatches?.length) {
			this.context.completeWith({ text: value });
			return;
		}

		const allEmojis = emojisMatches.flatMap((match) => [...match.toString()]);

		const emoji = allEmojis[0];

		let text = value;

		//if (allEmojis.length === 1) {
		text = text.replace(emoji, '');
		//}
		this.context.completeWith({ emoji, text: text });
	}

	onKeyUp(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			this.save();
		}
	}
}
