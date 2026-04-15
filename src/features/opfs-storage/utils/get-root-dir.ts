export const getRootDir = async (): Promise<FileSystemDirectoryHandle> => {
	return navigator.storage.getDirectory();
};
