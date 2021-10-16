import { Component } from '@angular/core';
import { AppQuery } from '../../state/app.query';
import { map } from 'rxjs/operators';

@Component({
	selector: 'cb-tv',
	templateUrl: './tv.component.html',
	styleUrls: ['./tv.component.scss'],
})
export class TvComponent {
	constructor(private appQuery: AppQuery) {}

	primeTimePrograms$ = this.appQuery
		.select()
		.pipe(map((state) => state.tvPrograms?.primeTime || []));
}
