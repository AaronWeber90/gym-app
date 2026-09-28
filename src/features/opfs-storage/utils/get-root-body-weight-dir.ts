import { getDir } from "./get-dir";
import { getRootDir } from "./get-root-dir";

export const getRootBodyWeightDir =
	async (): Promise<FileSystemDirectoryHandle> => {
		const root = await getRootDir();
		return getDir(root, "body-weight", true);
	};
