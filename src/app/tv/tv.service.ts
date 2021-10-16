import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { Channel, Programme, ProgrammeWithDuration } from '../model/tv.model';
import { map, tap } from 'rxjs/operators';
import { intervalToDuration, parseISO, setMinutes } from 'date-fns/esm';
import { setHours } from 'date-fns';
import { padStart } from 'lodash-es';

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
	constructor(private fns: AngularFireFunctions) {}

	getPrimeTimeProgram(): Observable<Programme[]> {
		const callable = this.fns.httpsCallable('primeTimePrograms');
		const from: Date = setMinutes(setHours(Date.now(), 20), 45);
		const to: Date = setMinutes(setHours(Date.now(), 21), 20);
		return callable({
			targetRange: { from, to },
		}).pipe(
			tap((_) => console.log('Fetching latest TV program', _)),
			map((programs: RawProgramme[]) =>
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
