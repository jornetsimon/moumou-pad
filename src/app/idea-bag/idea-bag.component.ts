import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { TuiRippleModule } from '@taiga-ui/addon-mobile';
import { TuiValueChangesModule } from '@taiga-ui/cdk';
import {
	TuiButtonModule,
	TuiDataListModule,
	TuiHostedDropdownModule,
	TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { TuiBadgeNotificationModule } from '@taiga-ui/experimental';
import { TuiInputModule, TuiInputMonthModule, TuiMultiSelectModule } from '@taiga-ui/kit';
import { kebabCase } from 'lodash-es';
import { NgxVibrationModule } from 'ngx-vibration';
import { from, scan } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { SuggestionQuery } from './suggestion-query.service';
import { Suggestion } from './suggestion.model';
import { SuggestionService } from './suggestion.service';

@Component({
	selector: 'cb-idea-bag',
	standalone: true,
	imports: [
		TuiHostedDropdownModule,
		TuiButtonModule,
		MatIcon,
		TuiDataListModule,
		TuiMultiSelectModule,
		AsyncPipe,
		ReactiveFormsModule,
		TuiInputModule,
		TuiInputMonthModule,
		TuiTextfieldControllerModule,
		TuiValueChangesModule,
		TuiBadgeNotificationModule,
		NgxVibrationModule,
		TuiRippleModule,
	],
	templateUrl: './idea-bag.component.html',
	styleUrl: './idea-bag.component.less',
	encapsulation: ViewEncapsulation.None,
})
export class IdeaBagComponent {
	constructor(
		private readonly suggestionQuery: SuggestionQuery,
		private readonly suggestionService: SuggestionService,
		private readonly destroyRef: DestroyRef
	) {}

	readonly suggestions$ = this.suggestionQuery.selectAll().pipe(
		scan((acc, current) => {
			const newItems = current.filter((item) => !acc.find(({ id }) => item.id === id));
			return [...acc, ...newItems];
		}, [] as Suggestion[])
	);

	readonly suggestionsCount$ = this.suggestionQuery.selectAll().pipe(
		map((suggestions) => suggestions.length),
		delay(1250)
	);

	readonly crossedOffItemsCtrl = new FormControl<Suggestion[]>([], { nonNullable: true });
	readonly newItemCtrl = new FormControl<string>('', { nonNullable: true });

	addIdea(value: string) {
		from(this.suggestionService.add({ name: value, id: kebabCase(value) }))
			.pipe(
				tap(() => {
					this.newItemCtrl.reset();
				}),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe();
	}

	suggestionClicked(suggestion: Suggestion) {
		const isCrossedOff = this.crossedOffItemsCtrl.value.find(({ id }) => suggestion.id === id);

		if (isCrossedOff) {
			this.suggestionService.delete(suggestion.id);
		} else {
			this.addIdea(suggestion.name);
		}
	}
}
