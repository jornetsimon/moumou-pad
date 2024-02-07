export function constructAssetUrl(asset: string | undefined): string {
	if (!asset) {
		return '';
	}
	return `https://static.jow.fr/${asset}`;
}
