import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TvComponent } from './tv.component';

@NgModule({
	declarations: [TvComponent],
	imports: [CommonModule],
	exports: [TvComponent],
})
export class TvModule {}
