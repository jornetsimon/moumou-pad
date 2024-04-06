import { Injectable } from '@angular/core';
import { AppQuery } from '../../../../state/app.query';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppService } from '../../../../state/app.service';

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
		map((config) => config?.emojis ?? []),
		map((userEmojis) => {
			const missingDefaultEmojis = this.defaultEmojis.filter(
				(emoji) => !userEmojis.includes(emoji)
			);
			return [...userEmojis, ...missingDefaultEmojis].slice(0, this.maxEmojis);
		})
	);

	setEmojisAsUsed(emojis: string[]) {
		const currentEmojis = this.appQuery.getValue().userData?.config.emojis ?? [];
		const updatedEmojis = [...emojis, ...currentEmojis];
		return this.appService.setConfig({ emojis: [...new Set(updatedEmojis)] });
	}
}
