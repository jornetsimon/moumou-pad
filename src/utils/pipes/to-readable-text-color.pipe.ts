import { Pipe, PipeTransform } from '@angular/core';
import { hasBadContrast } from 'color2k';

type Standard = 'decorative' | 'readable' | 'aa' | 'aaa';

@Pipe({
	name: 'toReadableTextColor',
	standalone: true,
})
export class ToReadableTextColorPipe implements PipeTransform {
	transform(
		color: string,
		comparedTo = '#fff',
		standard: Standard = 'decorative',
		fallbackTo = '#000'
	): string {
		if (color.startsWith('var(--')) {
			return color;
		}

		const badContrast = hasBadContrast(color, standard, comparedTo);
		return badContrast ? fallbackTo : color;
	}
}
