import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Channel, Programme, ProgrammeWithDuration } from '../model/tv.model';
import { map, tap } from 'rxjs/operators';
import { intervalToDuration, parseISO, setMinutes } from 'date-fns/esm';
import { setHours } from 'date-fns';
import { padStart } from 'lodash-es';
import { Functions, httpsCallable } from '@angular/fire/functions';

type RawProgramme = Omit<Programme, '_attributes'> & {
	_attributes: { start: string; stop: string; durationHours: number; channel: Channel };
};

export function programsWithDuration(
	source: Observable<Programme[]>
): Observable<ProgrammeWithDuration[]> {
	return source.pipe(
		map((programs) =>
			programs.map((p) => {
				const duration = intervalToDuration({
					start: p._attributes.start,
					end: p._attributes.stop,
				});
				const hours = duration.hours;
				const minutes = duration.minutes;
				const hourStr = hours && hours > 0 ? hours.toString() : '';
				const minutesStr =
					minutes && minutes > 0 ? padStart(minutes.toString(), 2, '0') : '';
				const durationStr = `${hourStr ? hourStr + 'h' : ''}${
					!hourStr && minutesStr ? minutesStr + 'm' : minutesStr
				}`;
				return {
					...p,
					_attributes: {
						...p._attributes,
						durationStr,
					},
				};
			})
		)
	);
}

@Injectable({
	providedIn: 'root',
})
export class TvService {
	constructor(private fns: Functions) {}

	getPrimeTimeProgram(): Observable<Programme[]> {
		const callable = httpsCallable<{ targetRange: { from: Date; to: Date } }, RawProgramme[]>(
			this.fns,
			'primeTimePrograms'
		);
		const fromDate: Date = setMinutes(setHours(Date.now(), 20), 45);
		const toDate: Date = setMinutes(setHours(Date.now(), 21), 20);
		return from(
			callable({
				targetRange: { from: fromDate, to: toDate },
			})
		).pipe(
			map((res) => res.data),
			tap((_) => console.log('Fetching latest TV program', _)),
			map((programs) =>
				programs.map((program) => ({
					...program,
					_attributes: {
						...program._attributes,
						start: parseISO(program._attributes.start),
						stop: parseISO(program._attributes.stop),
					},
				}))
			)
		);
	}
}
