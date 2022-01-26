import { Component } from '@angular/core';
import { SearchService } from './search.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';

@Component({
	selector: 'cb-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
	constructor(private searchService: SearchService) {}

	termFc = new FormControl(undefined, [Validators.minLength(2)]);
	form = new FormGroup({ term: this.termFc });

	searchResults$ = this.termFc.valueChanges.pipe(
		debounceTime(500),
		filter(() => this.termFc.valid),
		tap((_) => console.log('term', _)),
		switchMap((term: string) => this.searchService.search(term))
	);
}
