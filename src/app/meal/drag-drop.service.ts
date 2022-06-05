import { EventEmitter, Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';
import { Meal } from './state/meal.model';

@Injectable({ providedIn: 'root' })
export class DragDropService {
	private dragging = new EventEmitter<Meal | false>();
	dragging$ = this.dragging.asObservable().pipe(shareReplay(1));

	dragStart(meal: Meal) {
		this.dragging.emit(meal);
	}
	dragStop() {
		this.dragging.emit(false);
	}
}
