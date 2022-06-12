import { UserConfig } from './user-config';
import { Calendar } from '../shared/google-api/types/calendar.model';

export interface UserData {
	config: UserConfig;
	calendars: Calendar[];
	familyName: string;
	isAllowedInFamily: boolean;
}
