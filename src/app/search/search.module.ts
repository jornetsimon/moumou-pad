import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { SharedModule } from '../shared/shared.module';
import { MealComponent } from '../planning/meal/meal.component';

@NgModule({
	declarations: [SearchComponent],
	exports: [SearchComponent],
	imports: [CommonModule, SharedModule, MealComponent],
})
export class SearchModule {}
