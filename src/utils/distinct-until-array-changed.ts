import { distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';

export function distinctUntilArrayChanged<T>() {
	return (source: Observable<T>) => source.pipe(distinctUntilChanged((a, b) => isEqual(a, b)));
}
