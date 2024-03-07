import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { MealComponent } from '../planning/meal/meal.component';

@NgModule({
	declarations: [SearchComponent],
	exports: [SearchComponent],
	imports: [CommonModule, MealComponent],
})
export class SearchModule {}
