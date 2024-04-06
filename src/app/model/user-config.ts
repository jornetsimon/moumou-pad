import { WeekdayValue } from './weekday';

export interface UserConfig {
	startWeekOn: WeekdayValue;
	familyName?: string;
	city?: string;
	emojis?: string[];
}
