export const weekdaysValues = [0, 1, 2, 3, 4, 5, 6] as const;
export enum WeekdayLabel {
	Monday = 'lundi',
	Tuesday = 'mardi',
	Wednesday = 'mercredi',
	Thursday = 'jeudi',
	Friday = 'vendredi',
	Saturday = 'samedi',
	Sunday = 'dimanche',
}
export type WeekdayValue = typeof weekdaysValues[number];
export const weekdays: Record<WeekdayLabel, WeekdayValue> = {
	lundi: 0,
	mardi: 1,
	mercredi: 2,
	jeudi: 3,
	vendredi: 4,
	samedi: 5,
	dimanche: 6,
};
