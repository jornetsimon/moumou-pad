import { EventEmitter, Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DragDropService {
	private dragging = new EventEmitter<boolean>();
	dragging$ = this.dragging.asObservable().pipe(shareReplay(1));

	dragStart() {
		this.dragging.emit(true);
	}
	dragStop() {
		this.dragging.emit(false);
	}
}
