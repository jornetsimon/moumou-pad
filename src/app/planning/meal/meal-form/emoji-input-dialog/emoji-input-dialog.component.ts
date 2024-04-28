import { Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiButtonModule, TuiDialogContext, TuiErrorModule } from '@taiga-ui/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiFieldErrorPipeModule, TuiInputModule } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MealEmojisService } from '../meal-emojis.service';
import { merge } from 'rxjs';
import { TuiAutoFocusModule } from '@taiga-ui/cdk';

export type EmojiInputDialogOutput = string | null;

@UntilDestroy()
@Component({
	selector: 'cb-emoji-input-dialog',
	standalone: true,
	imports: [
		TuiInputModule,
		TuiErrorModule,
		ReactiveFormsModule,
		TuiFieldErrorPipeModule,
		AsyncPipe,
		TuiButtonModule,
		TuiAutoFocusModule,
	],
	templateUrl: './emoji-input-dialog.component.html',
	styleUrl: './emoji-input-dialog.component.less',
})
export class EmojiInputDialogComponent {
	constructor(
		@Inject(POLYMORPHEUS_CONTEXT)
		private readonly context: TuiDialogContext<EmojiInputDialogOutput, void>
	) {
		merge(this.saveOnFirstValidInput()).pipe(untilDestroyed(this)).subscribe();
	}

	readonly control = new FormControl<string>('', {
		nonNullable: true,
		validators: [Validators.required, Validators.pattern(MealEmojisService.emojiRegex)],
	});

	cancel() {
		this.context.completeWith(null);
	}

	private saveOnFirstValidInput() {
		const nonEmojiPattern = new RegExp(`(?!${MealEmojisService.emojiRegex.source}).`, 'gu');

		return this.control.statusChanges.pipe(
			distinctUntilChanged(),
			filter((status) => status === 'VALID'),
			map(() => this.control.value),
			take(1),
			map((value) => value.replace(nonEmojiPattern, '')),
			tap((emoji) => this.context.completeWith(emoji))
		);
	}
}
