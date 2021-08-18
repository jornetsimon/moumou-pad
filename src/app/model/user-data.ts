import { UserConfig } from './user-config';

export interface UserData {
	config: UserConfig;
	familyName: string;
	isAllowedInFamily: boolean;
}
