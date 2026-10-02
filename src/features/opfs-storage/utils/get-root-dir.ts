export const getRootDir = async (): Promise<FileSystemDirectoryHandle> =>
	await navigator.storage.getDirectory();
