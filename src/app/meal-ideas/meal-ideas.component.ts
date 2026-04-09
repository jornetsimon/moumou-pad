import { NgStyle } from '@angular/common';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	computed,
	Inject,
	ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MealIdea } from '@functions/model/meal-idea.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TuiRepeatTimesModule } from '@taiga-ui/cdk';
import {
	TuiButtonModule,
	TuiDialogContext,
	TuiGroupModule,
	TuiLoaderModule,
	TuiSvgModule,
	TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import {
	TuiCardModule,
	TuiCellModule,
	TuiHeaderModule,
	TuiSkeletonModule,
	TuiSurfaceModule,
	TuiTitleModule,
} from '@taiga-ui/experimental';
import { TuiInputModule, TuiTagModule } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { debounceTime, distinctUntilChanged, filter, map, startWith, tap } from 'rxjs';
import { ToReadableTextColorPipe } from '../../utils/pipes/to-readable-text-color.pipe';
import { constructAssetUrl } from '../jow/util';
import { UrlPreviewPipe } from '../shared/url-preview.pipe';
import { MealIdeasService } from './meal-ideas.service';

export type MealIdeasDialogOutput = MealIdea | null;

@UntilDestroy()
@Component({
	selector: 'cb-meal-ideas',
	imports: [
		TuiCardModule,
		TuiHeaderModule,
		TuiSurfaceModule,
		TuiTitleModule,
		NgStyle,
		TuiCellModule,
		UrlPreviewPipe,
		TuiTagModule,
		ToReadableTextColorPipe,
		TuiRepeatTimesModule,
		TuiGroupModule,
		TuiButtonModule,
		TuiSkeletonModule,
		ScrollingModule,
		ReactiveFormsModule,
		TuiInputModule,
		TuiTextfieldControllerModule,
		TuiLoaderModule,
		TuiSvgModule,
	],
	templateUrl: './meal-ideas.component.html',
	styleUrl: './meal-ideas.component.less',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealIdeasComponent implements AfterViewInit {
	@ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

	readonly searchCtrl = new FormControl('', { nonNullable: true });
	readonly itemSize = 118;

	private readonly searchTerm = toSignal(
		this.searchCtrl.valueChanges.pipe(startWith(''), debounceTime(300)),
		{ initialValue: '' }
	);

	readonly ideas = computed(() => {
		const term = this.searchTerm().toLowerCase();
		return this.ideasService
			.ideas()
			.map((idea) => ({
				...idea,
				absoluteRating: Math.abs(idea.rating),
				notionPageDeeplink: idea.notionPageUrl.replace(/http(s)?:\/\//, 'notion://'),
			}))
			.filter((idea) => !term || idea.name.toLowerCase().includes(term));
	});

	readonly isLoading = this.ideasService.areIdeasLoading;
	readonly isLoadingMore = this.ideasService.isLoadingMore;
	readonly hasMore = this.ideasService.hasMore;

	readonly viewportHeight = computed(() => {
		const count = this.ideas().length;
		return Math.min(count * this.itemSize, 500);
	});

	constructor(
		@Inject(POLYMORPHEUS_CONTEXT)
		private readonly context: TuiDialogContext<MealIdeasDialogOutput, void>,
		private readonly ideasService: MealIdeasService
	) {
		this.ideasService.resetAndSearch('');
		this.setupSearch();
	}

	ngAfterViewInit() {
		this.viewport
			.elementScrolled()
			.pipe(
				map(() => this.viewport.measureScrollOffset('bottom')),
				map((offset) => offset < 200),
				distinctUntilChanged(),
				filter((nearEnd) => nearEnd),
				tap(() => this.ideasService.fetchMore()),
				untilDestroyed(this)
			)
			.subscribe();
	}

	useIdea(idea: MealIdea) {
		this.context.completeWith(idea);
	}

	blurTarget(event: Event) {
		(event.target as HTMLElement).blur();
	}

	trackByName = (_: number, idea: { name: string }) => idea.name;

	protected readonly constructAssetUrl = constructAssetUrl;

	private setupSearch() {
		this.searchCtrl.valueChanges
			.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				tap((term) => this.ideasService.resetAndSearch(term)),
				untilDestroyed(this)
			)
			.subscribe();
	}
}
