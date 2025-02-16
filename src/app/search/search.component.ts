import { Component } from '@angular/core';
import { SearchService } from './search.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, filter, switchMap } from 'rxjs/operators';

@Component({
    selector: 'cb-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.less'],
    standalone: false
})
export class SearchComponent {
	constructor(private searchService: SearchService) {}

	termFc = new FormControl<string | undefined>(undefined, {
		nonNullable: true,
		validators: [Validators.minLength(2)],
	});
	form = new FormGroup({ term: this.termFc });

	searchResults$ = this.termFc.valueChanges.pipe(
		debounceTime(500),
		filter((term): term is string => this.termFc.valid && !!term),
		switchMap((term) => this.searchService.search(term))
	);
}
