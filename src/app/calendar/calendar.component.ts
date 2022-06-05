import { Component } from '@angular/core';
import { CalendarApiService } from '../shared/google-api';

@Component({
	selector: 'cb-calendar',
	templateUrl: './calendar.component.html',
	styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
	constructor(private calendarApiService: CalendarApiService) {
		this.calendarApiService.fetchEvents().subscribe((events) => console.log({ events }));
	}
}
