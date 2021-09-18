export interface MealTheme {
	color?: string;
	backgroundImage?: string;
	emoji?: string;
	shadow?: boolean;
}
export const MEAL_THEMES: Array<{ keywords: string[]; theme: MealTheme }> = [
	{
		keywords: ['brunch'],
		theme: {
			color: '#bd5a21',
			backgroundImage:
				'https://images.unsplash.com/photo-1493770348161-369560ae357d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1',
			emoji: '🥐',
			shadow: false,
		},
	},
	{
		keywords: ['mcdo', 'macdo', 'mc do', 'mac do'],
		theme: {
			color: '#FFC72C',
			backgroundImage: 'https://images.unsplash.com/photo-1567278526167-6290689c10d4',
			emoji: '🍔🍟',
			shadow: false,
		},
	},
];
