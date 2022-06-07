import { UntilDestroy } from '@ngneat/until-destroy';
import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Calendar, CalendarEvent, CalendarEventsData } from './types/calendar.model';

export interface GoogleApiState {
	calendars: Calendar[];
	calendarEventsData?: Omit<CalendarEventsData, 'items'>;
	calendarEvents: CalendarEvent[];
}

export function createInitialState(): GoogleApiState {
	return {
		calendars: [],
		calendarEvents: [],
	};
}

@UntilDestroy()
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'google-api' })
export class GoogleApiStore extends Store<GoogleApiState> {
	constructor() {
		super(createInitialState());
	}
}
