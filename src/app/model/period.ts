import { endOfWeek, startOfWeek } from 'date-fns';

export interface Period {
	from: Date;
	to: Date;
}

export function generateSchedule(): Period {
	const now = Date.now();
	return {
		from: startOfWeek(now, { weekStartsOn: 1 }),
		to: endOfWeek(now, { weekStartsOn: 1 }),
	};
}
