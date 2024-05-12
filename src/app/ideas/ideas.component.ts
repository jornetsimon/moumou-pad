import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IdeasService } from './ideas.service';

@UntilDestroy()
@Component({
	selector: 'cb-ideas',
	standalone: true,
	imports: [],
	templateUrl: './ideas.component.html',
	styleUrl: './ideas.component.less',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeasComponent {
	constructor(private readonly ideasService: IdeasService) {
		this.ideasService.fetchIdeas();
	}
}
