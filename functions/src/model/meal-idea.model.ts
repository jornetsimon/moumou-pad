export interface MealIdea {
	name: string;
	image?: string;
	tags: Array<{ name: string; color: string }>;
	url?: string;
	rating: number;
	notionPageUrl: string;
	created_at: string;
}

export interface NotionIdeasRequest {
	start_cursor?: string;
	page_size?: number;
	search_term?: string;
}

export interface NotionIdeasResponse {
	ideas: MealIdea[];
	has_more: boolean;
	next_cursor: string | null;
}
