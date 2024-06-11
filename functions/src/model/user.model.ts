import { WeekdayValue } from './weekday.model';

export interface User {
	config: UserConfig;
	familyName: string;
	isAllowedInFamily: boolean;
}

export interface UserConfig {
	startWeekOn: WeekdayValue;
	familyName?: string;
	city?: string;
	emojis?: Record<string, number>;
	notion?: {
		integration_secret: string;
		database_id: string;
	};
}
