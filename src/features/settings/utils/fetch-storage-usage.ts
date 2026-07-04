export async function fetchStorageUsage() {
	const estimate = await navigator.storage.estimate();
	return {
		usage: estimate.usage ?? 0,
		quota: estimate.quota ?? 0,
	};
}
