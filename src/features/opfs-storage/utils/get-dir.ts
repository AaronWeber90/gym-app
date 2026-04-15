export const getDir = async (
	parent: FileSystemDirectoryHandle,
	name: string,
	create = false,
): Promise<FileSystemDirectoryHandle> => {
	return parent.getDirectoryHandle(name, { create });
};
