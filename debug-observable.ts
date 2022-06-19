import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { differenceInMilliseconds } from 'date-fns';
import { environment } from 'src/environments/environment';
import { cloneDeep } from 'lodash-es';

const EVENT_COLORS: Record<
	EventType,
	[primaryColor: string, fadedColor: string, secondaryColor: string]
> = {
	next: ['#1E90FF', 'rgba(30,144,255,0.4)', 'white'],
	error: ['#F81744', 'rgba(248,23,68,0.4)', 'white'],
	complete: ['#49BA5A', 'rgba(73,186,90,0.4)', 'white'],
};

const PADDING = `padding: .25em .5em`;
const BORDER_RADIUS = `border-radius: 5px`;
const FONT_WEIGHT = `font-weight: bold`;

const muteLogs = environment.production;

type EventType = 'next' | 'error' | 'complete';

interface Options {
	replay?: boolean;
	onlyEvents?: EventType[];
}

/**
 * Log observable events for debugging
 * - Logs get muted on production
 * - Values are deep cloned before getting displayed
 * @param description A message or identifier describing the stream
 * @param options Extra options
 * @param options.replay Show the replay of the events history
 * @param options.onlyEvents Only log specified type of events ('next', 'error', 'complete')
 */
export function debugObservable<T>(
	description?: string,
	options: Options = {
		replay: false,
		onlyEvents: undefined,
	}
) {
	const history: Array<{ event: EventType; date: Date; value: unknown }> = [];
	return (source: Observable<T>) => {
		if (muteLogs) {
			return source;
		}
		return source.pipe(
			tap({
				next: (val) => {
					log('next', val);
				},
				error: (err: unknown) => {
					log('error', err);
				},
				complete: () => {
					log('complete', undefined);
				},
			})
		);
	};

	function log(event: EventType, value: unknown) {
		history.push({ event, date: new Date(), value });
		const events = options.onlyEvents || ['next', 'error', 'complete'];

		if (!events.includes(event)) {
			return;
		}

		if (options.replay) {
			logReplay();
		} else {
			console.log(...getLogEntry(event, value));
		}
	}

	/**
	 * Builds the content of a log message
	 */
	function getLogEntry(
		event: EventType,
		value: unknown,
		nestingLevel = 0,
		timeDiffInSecond?: number,
		isLast = true
	): string[] | [...string[], unknown] {
		const [primaryColor, fadedColor, secondaryColor] = EVENT_COLORS[event];
		const mainColor = isLast ? primaryColor : fadedColor;

		const styles: string[] = [];

		let indent = ``;
		if (options.replay) {
			indent = '%c ';
			styles.push(`margin-left: -1em; margin-right: ${nestingLevel * 10}px;`);
		}

		let descriptionContent = '';
		if (description) {
			descriptionContent = `%c${description}`;
			styles.push(
				`font-weight: bold; color: ${mainColor}; border: 1px solid ${mainColor}; border-radius: 5px 0 0 5px; border-right: none; ${PADDING}; margin-right: -2px;`
			);
		}

		const eventContent = `%c${event.toUpperCase()}${
			timeDiffInSecond !== undefined ? ` (+${timeDiffInSecond}s)` : ''
		}`;
		styles.push(
			`color: ${secondaryColor}; background-color: ${mainColor}; border: 1px solid ${mainColor}; ${FONT_WEIGHT}; ${BORDER_RADIUS}; ${PADDING};`
		);

		const content = [`${indent}${descriptionContent}${eventContent}`, ...styles];

		switch (event) {
			case 'complete':
				return content;
			default:
				return [...content, cloneDeep(value)];
		}
	}

	/**
	 * Logs every event in the history since the first encountered
	 */
	function logReplay() {
		console.group(
			`%cREPLAY${description ? ` of ${description}` : ''} ⏪`,
			`background-color: #393D3F; color: white; ${BORDER_RADIUS}; padding: .25em .75em;`
		);
		history.forEach(({ event, date, value }, index, array) => {
			const isLatest = index === array.length - 1;
			const lastEntry = index === 0 ? undefined : array[index - 1];
			const timeDiffInSecond = lastEntry
				? Number((differenceInMilliseconds(date, lastEntry.date) / 1000).toFixed(2))
				: undefined;
			console.log(...getLogEntry(event, value, index, timeDiffInSecond, isLatest));
		});
		console.groupEnd();
	}
}

/**
 * Log observable NEXT events for debugging
 * @param message
 * @param options
 */
export function debugNext<T>(message?: string, options?: Omit<Options, 'onlyEvents'>) {
	return debugObservable<T>(message, { ...options, onlyEvents: ['next'] });
}
