import { Injectable } from '@angular/core';
import { AppQuery } from '../../../../state/app.query';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppService } from '../../../../state/app.service';
import { isEqual } from 'lodash-es';

@Injectable()
export class MealEmojisService {
	constructor(
		private readonly appQuery: AppQuery,
		private readonly appService: AppService
	) {}

	readonly defaultEmojis: string[] = ['❄️', '🐱', '✅'];
	readonly maxEmojis = 6;
	readonly emojiRegex = /<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu;

	readonly emojis$: Observable<string[]> = this.appQuery.userConfig$.pipe(
		map((config) => config?.emojis ?? {}),
		map((emojis) =>
			Object.entries(emojis)
				.map(([emoji, usageCount]) => ({ emoji, usageCount }))
				.sort((a, b) => b.usageCount - a.usageCount)
				.map(({ emoji }) => emoji)
		),
		map((userEmojis) => {
			const missingDefaultEmojis = this.defaultEmojis.filter(
				(emoji) => !userEmojis.includes(emoji)
			);
			return [...userEmojis, ...missingDefaultEmojis].slice(0, this.maxEmojis);
		})
	);

	setEmojisAsUsed(emojis: string[]) {
		const currentEmojis = this.appQuery.getValue().userData?.config.emojis ?? [];

		const newEmojis = emojis
			.filter((emoji) => !Object.keys(currentEmojis).includes(emoji))
			.reduce<Record<string, number>>((acc, emoji) => ({ ...acc, [emoji]: 1 }), {});

		const updatedEmojis = Object.entries(currentEmojis).reduce<Record<string, number>>(
			(acc, [emoji, count]) => {
				const alreadyInRecord = emojis.includes(emoji);
				const newCount = alreadyInRecord ? count + 1 : count;
				return { ...acc, [emoji]: newCount };
			},
			{}
		);

		const newData = { ...updatedEmojis, ...newEmojis };

		if (isEqual(currentEmojis, newData)) {
			return Promise.resolve();
		}

		return this.appService.setConfig({ emojis: newData });
	}
}
