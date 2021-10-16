import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TvComponent } from './tv.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [TvComponent],
	imports: [CommonModule, SharedModule],
	exports: [TvComponent],
})
export class TvModule {}
