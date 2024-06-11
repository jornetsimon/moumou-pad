import { WeekdayValue } from './weekday.model';

export interface User {
	config: UserConfig;
	familyName: string;
	isAllowedInFamily: boolean;
	notion?: {
		integration_secret: string;
		database_id: string;
	};
	emojis?: Record<string, number>;
}

export interface UserConfig {
	startWeekOn: WeekdayValue;
	familyName?: string;
	city?: string;
}
