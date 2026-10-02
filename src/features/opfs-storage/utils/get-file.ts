export const getFile = async (
	parent: FileSystemDirectoryHandle,
	name: string,
	create = false,
): Promise<FileSystemFileHandle> =>
	await parent.getFileHandle(name, { create });
