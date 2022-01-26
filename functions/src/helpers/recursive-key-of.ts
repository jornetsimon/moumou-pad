/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Source: https://stackoverflow.com/questions/65332597/typescript-is-there-a-recursive-keyof
 */
export type RecursiveKeyOf<TObj extends Record<string, any>, OnlyOfType = any> = {
	[TKey in keyof TObj & (string | number)]: TObj[TKey] extends Array<infer Q>
		? Q extends OnlyOfType
			? `${TKey}`
			: never
		: TObj[TKey] extends Record<string, unknown>
		? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey], OnlyOfType>}`
		: TObj[TKey] extends OnlyOfType
		? `${TKey}`
		: never;
}[keyof TObj & (string | number)];
