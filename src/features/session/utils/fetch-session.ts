import { getDir, getRootDir } from "../../opfs-storage/utils";
import type { SessionData } from "./types";

export const fetchSession = async (
	workoutId: string,
	sessionId: string,
): Promise<SessionData> => {
	const root = await getRootDir();
	const workoutsDir = await getDir(root, "workouts", true);
	const parentDir = await workoutsDir.getDirectoryHandle(workoutId, {
		create: false,
	});
	const fileHandle = await parentDir.getFileHandle(`${sessionId}.json`);
	const file = await fileHandle.getFile();
	const text = await file.text();
	return JSON.parse(text);
};
