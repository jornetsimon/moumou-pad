export function removeAccents(str: string): string {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
export function sanitizeString(str: string): string {
	return removeAccents(str.trim().toLocaleLowerCase());
}
export function stringContainsEmoji(str: string): boolean {
	return /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi.test(
		str
	);
}
export function isNotNullOrUndefined<T>(input: T | null | undefined): input is T {
	return input !== undefined && input !== null;
}
