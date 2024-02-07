import { Pipe, PipeTransform } from '@angular/core';
import * as tinycolor from 'tinycolor2';

@Pipe({
	name: 'toReadableTextColor',
	standalone: true,
})
export class ToReadableTextColorPipe implements PipeTransform {
	transform(color: string): string {
		if (new tinycolor(color).getLuminance() > 0.15) {
			return '#000';
		} else {
			return '#fff';
		}
	}
}
