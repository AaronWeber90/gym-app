export const getRootDir = async (): Promise<FileSystemDirectoryHandle> => {
	return navigator.storage.getDirectory();
};

export const getDir = async (
	parent: FileSystemDirectoryHandle,
	name: string,
	create = false,
): Promise<FileSystemDirectoryHandle> => {
	return parent.getDirectoryHandle(name, { create });
};

export const getFile = async (
	parent: FileSystemDirectoryHandle,
	name: string,
	create = false,
): Promise<FileSystemFileHandle> => {
	return parent.getFileHandle(name, { create });
};

export const getRootWorkoutsDir =
	async (): Promise<FileSystemDirectoryHandle> => {
		const root = await getRootDir();
		return getDir(root, "workouts", true);
	};
