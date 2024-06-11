import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'urlPreview',
	standalone: true,
})
export class UrlPreviewPipe implements PipeTransform {
	transform(url: string): unknown {
		return this.extractDomain(url);
	}

	private extractDomain(url: string): string {
		return new URL(url).hostname;
	}
}
