export function mapUndefinedToNull(obj: Record<string | number | symbol, unknown>) {
	return Object.entries(obj).reduce((acc, [key, val]) => {
		const newVal = val === undefined ? null : val;
		return { ...acc, [key]: newVal };
	}, {});
}
