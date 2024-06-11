export interface MealIdea {
	name: string;
	image?: string;
	tags: Array<{ name: string; color: string }>;
	url?: string;
	rating: number;
	notionPageUrl: string;
	created_at: string;
}
