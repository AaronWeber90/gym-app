export const getDir = async (
	parent: FileSystemDirectoryHandle,
	name: string,
	create = false,
): Promise<FileSystemDirectoryHandle> =>
	await parent.getDirectoryHandle(name, { create });
