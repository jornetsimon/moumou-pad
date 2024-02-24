import { Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiButtonModule, TuiDialogContext, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiSwipe, TuiSwipeModule } from '@taiga-ui/cdk';
import { CommonModule } from '@angular/common';
import { TuiTextareaModule } from '@taiga-ui/kit';

export type MemoDialogInput = string | undefined;
export type MemoDialogOutput = string | null;

@Component({
	selector: 'cb-memo',
	templateUrl: './memo.component.html',
	styleUrls: ['./memo.component.less'],
	standalone: true,
	imports: [
		CommonModule,
		TuiTextareaModule,
		TuiButtonModule,
		TuiTextfieldControllerModule,
		TuiSwipeModule,
		ReactiveFormsModule,
	],
})
export class MemoComponent {
	constructor(
		@Inject(POLYMORPHEUS_CONTEXT)
		private readonly context: TuiDialogContext<MemoDialogOutput, MemoDialogInput>
	) {}

	readonly control = new FormControl(this.context.data);

	cancel() {
		this.context.completeWith(this.context.data ?? null);
	}

	save() {
		console.log(this.control.value);
		this.context.completeWith(this.control.value ?? null);
	}

	onSwipe(swipeEvent: TuiSwipe) {
		if (swipeEvent.direction === 'bottom') {
			this.context.completeWith(null);
		}
	}
}
