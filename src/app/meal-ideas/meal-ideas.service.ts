import { Injectable, signal } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MealIdea, NotionIdeasRequest, NotionIdeasResponse } from '@functions/model/meal-idea.model';

@Injectable({
	providedIn: 'root',
})
export class MealIdeasService {
	constructor(private readonly fns: Functions) {}

	readonly ideas = signal<MealIdea[]>([]);
	private readonly _areIdeasLoading = signal(false);
	readonly areIdeasLoading = this._areIdeasLoading.asReadonly();

	private readonly _isLoadingMore = signal(false);
	readonly isLoadingMore = this._isLoadingMore.asReadonly();

	private readonly _hasMore = signal(true);
	readonly hasMore = this._hasMore.asReadonly();

	private _nextCursor = signal<string | null>(null);
	private _currentSearchTerm = '';

	async fetchIdeas(options: { reset?: boolean; search_term?: string } = {}) {
		const isReset = options.reset ?? false;

		if (isReset) {
			this.ideas.set([]);
			this._nextCursor.set(null);
			this._hasMore.set(true);
		}

		if (!this._hasMore()) return;

		const isInitial = this.ideas().length === 0;
		if (isInitial) {
			this._areIdeasLoading.set(true);
		} else {
			this._isLoadingMore.set(true);
		}

		const callable = httpsCallable<NotionIdeasRequest, NotionIdeasResponse>(
			this.fns,
			'notionIdeas'
		);
		const cursor = this._nextCursor();
		const response = await callable({
			page_size: 20,
			...(cursor ? { start_cursor: cursor } : {}),
			...(options.search_term ? { search_term: options.search_term } : {}),
		});

		const { ideas: newIdeas, has_more, next_cursor } = response.data;
		this.ideas.update((current) => (isReset ? newIdeas : [...current, ...newIdeas]));
		this._hasMore.set(has_more);
		this._nextCursor.set(next_cursor);

		this._areIdeasLoading.set(false);
		this._isLoadingMore.set(false);
	}

	async fetchMore() {
		if (this._isLoadingMore() || !this._hasMore()) return;
		await this.fetchIdeas({ search_term: this._currentSearchTerm || undefined });
	}

	async resetAndSearch(term: string) {
		this._currentSearchTerm = term;
		await this.fetchIdeas({ reset: true, search_term: term || undefined });
	}
}
