import { Component } from '@angular/core';
import { AppQuery } from '../../state/app.query';
import { filter, switchMap, take } from 'rxjs/operators';
import { programsWithDuration, TvService } from './tv.service';

@Component({
	selector: 'cb-tv',
	templateUrl: './tv.component.html',
	styleUrls: ['./tv.component.less'],
})
export class TvComponent {
	constructor(
		private appQuery: AppQuery,
		private tvService: TvService
	) {}

	primeTimePrograms$ = this.appQuery.select('userData').pipe(
		filter(Boolean),
		take(1),
		switchMap(() => this.tvService.getPrimeTimeProgram()),
		programsWithDuration
	);
}
