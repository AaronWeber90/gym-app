import { getDir } from "./get-dir";
import { getRootDir } from "./get-root-dir";

export const getRootWorkoutsDir =
	async (): Promise<FileSystemDirectoryHandle> => {
		const root = await getRootDir();
		return getDir(root, "workouts", true);
	};
