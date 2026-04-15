export const getFile = async (
	parent: FileSystemDirectoryHandle,
	name: string,
	create = false,
): Promise<FileSystemFileHandle> => {
	return parent.getFileHandle(name, { create });
};
