import { CalendarEvent } from '../types/calendar.model';
import { Serialized } from '../../../../../functions/src/helpers/serialized';

export const mockEvents = [
	{
		kind: 'calendar#event',
		id: '1km3ia7rqdqnarel0e64m0v9p6',
		status: 'confirmed',
		htmlLink:
			'https://www.google.com/calendar/event?eid=MWttM2lhN3JxZHFuYXJlbDBlNjRtMHY5cDYgcXY4MDF1Y2xhZ3JycnUwbHF2NDZtZHZycjhAZw',
		created: '2022-06-01T17:15:04.000Z',
		updated: '2022-06-01T17:15:04.420Z',
		summary: 'Vente des billets match NFL ',
		creator: {
			email: 'jornetsimon@gmail.com',
		},
		organizer: {
			email: 'qv801uclagrrru0lqv46mdvrr8@group.calendar.google.com',
			displayName: 'Activités',
			self: true,
		},
		start: {
			dateTime: '2022-06-14T08:00:00.000Z',
			timeZone: 'Europe/Paris',
		},
		end: {
			dateTime: '2022-06-14T09:00:00.000Z',
			timeZone: 'Europe/Paris',
		},
		iCalUID: '1km3ia7rqdqnarel0e64m0v9p6@google.com',
		sequence: 0,
		guestsCanInviteOthers: false,
		reminders: {
			useDefault: false,
			overrides: [
				{
					method: 'popup',
					minutes: 5,
				},
				{
					method: 'popup',
					minutes: 15,
				},
			],
		},
		eventType: 'default',
	},
	{
		kind: 'calendar#event',
		id: '02stq2lap14a10nf35c3nesskd',
		status: 'confirmed',
		htmlLink:
			'https://www.google.com/calendar/event?eid=MDJzdHEybGFwMTRhMTBuZjM1YzNuZXNza2QgcXY4MDF1Y2xhZ3JycnUwbHF2NDZtZHZycjhAZw',
		created: '2022-06-01T17:19:32.000Z',
		updated: '2022-06-01T17:19:32.350Z',
		summary: 'Vente des billets match NFL ',
		creator: {
			email: 'jornetsimon@gmail.com',
		},
		organizer: {
			email: 'qv801uclagrrru0lqv46mdvrr8@group.calendar.google.com',
			displayName: 'Activités',
			self: true,
		},
		start: {
			dateTime: '2022-06-19T08:00:00.000Z',
			timeZone: 'Europe/Paris',
		},
		end: {
			dateTime: '2022-06-19T09:00:00.000Z',
			timeZone: 'Europe/Paris',
		},
		iCalUID: '02stq2lap14a10nf35c3nesskd@google.com',
		sequence: 0,
		guestsCanInviteOthers: false,
		reminders: {
			useDefault: false,
			overrides: [
				{
					method: 'popup',
					minutes: 5,
				},
				{
					method: 'popup',
					minutes: 15,
				},
			],
		},
		eventType: 'default',
	},
	{
		kind: 'calendar#event',
		id: '65gj2p1p74p62b9kc4pj2b9k70oj8bb1chi30bb274sj8c9n69gm8d346c',
		status: 'confirmed',
		htmlLink:
			'https://www.google.com/calendar/event?eid=NjVnajJwMXA3NHA2MmI5a2M0cGoyYjlrNzBvajhiYjFjaGkzMGJiMjc0c2o4YzluNjlnbThkMzQ2YyBxdjgwMXVjbGFncnJydTBscXY0Nm1kdnJyOEBn',
		created: '2018-09-30T20:59:18.000Z',
		updated: '2022-05-31T04:12:12.839Z',
		summary: 'Le mour',
		creator: {
			email: 'jornetsimon@gmail.com',
		},
		organizer: {
			email: 'qv801uclagrrru0lqv46mdvrr8@group.calendar.google.com',
			displayName: 'Activités',
			self: true,
		},
		start: {
			dateTime: '2023-11-24T19:00:00.000Z',
			timeZone: 'Europe/Paris',
		},
		end: {
			dateTime: '2023-11-24T20:30:00.000Z',
			timeZone: 'Europe/Paris',
		},
		iCalUID: '65gj2p1p74p62b9kc4pj2b9k70oj8bb1chi30bb274sj8c9n69gm8d346c@google.com',
		sequence: 0,
		extendedProperties: {
			private: {
				eventAttendeeList: '[]',
			},
		},
		reminders: {
			useDefault: false,
			overrides: [
				{
					method: 'popup',
					minutes: 60,
				},
			],
		},
		eventType: 'default',
	},
	{
		kind: 'calendar#event',
		id: '6gq3eeb5c4pm4b9n6gq3ab9kckpjgb9oclh68bb368omco9l69ij0c9g6k',
		status: 'confirmed',
		htmlLink:
			'https://www.google.com/calendar/event?eid=NmdxM2VlYjVjNHBtNGI5bjZncTNhYjlrY2twamdiOW9jbGg2OGJiMzY4b21jbzlsNjlpajBjOWc2ayBxdjgwMXVjbGFncnJydTBscXY0Nm1kdnJyOEBn',
		created: '2019-02-20T17:39:47.000Z',
		updated: '2019-02-20T17:39:47.450Z',
		summary: "C'est moi qui gagne 🎉💗",
		creator: {
			email: 'jornetsimon@gmail.com',
		},
		organizer: {
			email: 'qv801uclagrrru0lqv46mdvrr8@group.calendar.google.com',
			displayName: 'Activités',
			self: true,
		},
		start: {
			date: '2024-09-19T00:00:00.000Z',
		},
		end: {
			date: '2024-09-20T00:00:00.000Z',
		},
		transparency: 'transparent',
		iCalUID: '6gq3eeb5c4pm4b9n6gq3ab9kckpjgb9oclh68bb368omco9l69ij0c9g6k@google.com',
		sequence: 0,
		extendedProperties: {
			private: {
				eventAttendeeList: '[]',
			},
		},
		reminders: {
			useDefault: false,
			overrides: [
				{
					method: 'popup',
					minutes: 900,
				},
			],
		},
		eventType: 'default',
	},
] as unknown as Array<Serialized<CalendarEvent>>;
