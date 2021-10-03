import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root',
})
export class RenderService {
	constructor(private domSanitizer: DomSanitizer) {}

	renderLinkTags(input: string): string {
		const urlPattern =
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/;
		const exp = new RegExp(urlPattern, 'g');
		return input.replace(exp, (match) => {
			const sanitizedUrl = this.domSanitizer.sanitize(SecurityContext.URL, match);
			if (sanitizedUrl?.startsWith('unsafe')) {
				return sanitizedUrl;
			}
			return `<a href="${sanitizedUrl}" target="_blank">${sanitizedUrl}</a>`;
		});
	}

	renderLineReturns(input: string): string {
		const exp = new RegExp(/\n/, 'g');
		return input.replace(exp, '<br/>');
	}

	render(input: string): string {
		const operations: Array<(input: string) => string> = [
			this.renderLinkTags.bind(this),
			this.renderLineReturns.bind(this),
		];
		return operations.reduce((value, operation) => operation(value), input);
	}
}
