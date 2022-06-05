export type Serialized<T> = {
	[P in keyof T]: NonNullable<T[P]> extends Date
		? T[P] extends undefined
			? string | undefined
			: string
		: Serialized<T[P]>;
};
