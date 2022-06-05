import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleApiService } from './google-api.service';
import { CalendarEvent, CalendarEventsData } from './types/calendar.model';
import { map } from 'rxjs/operators';
import { Serialized } from '../../../../functions/src/helpers/serialized';

@Injectable({
	providedIn: 'root',
})
export class CalendarApiService {
	constructor(private googleApiService: GoogleApiService, private http: HttpClient) {}

	fetchEvents() {
		return this.http
			.get<Serialized<CalendarEventsData>>(
				'https://www.googleapis.com/calendar/v3/calendars/primary/events'
			)
			.pipe(
				map(
					(data): CalendarEventsData => ({
						...data,
						updated: new Date(data.updated),
						items: data.items.map(
							(event): CalendarEvent => ({
								...event,
								created: GoogleApiService.toDate(event.created),
								updated: GoogleApiService.toDate(event.updated),
								start: {
									...event.start,
									date: GoogleApiService.toDate(event.start.date),
									dateTime: GoogleApiService.toDate(event.start.dateTime),
								},
								end: {
									...event.end,
									date: GoogleApiService.toDate(event.end.date),
									dateTime: GoogleApiService.toDate(event.end.dateTime),
								},
								originalStartTime: event.originalStartTime
									? {
											...event.originalStartTime,
											date: GoogleApiService.toDate(
												event.originalStartTime?.date
											),
											dateTime: GoogleApiService.toDate(
												event.originalStartTime.dateTime
											),
									  }
									: undefined,
							})
						),
					})
				)
			);
	}
}
