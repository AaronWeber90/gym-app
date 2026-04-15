import { getRootDir } from "../../opfs-storage/utils";
import type { SessionData } from "./types";

export const saveSession = async (
	workoutId: string,
	sessionId: string,
	session: SessionData,
): Promise<SessionData> => {
	const root = await getRootDir();
	const workoutsDir = await root.getDirectoryHandle("workouts", {
		create: true,
	});
	const parentDir = await workoutsDir.getDirectoryHandle(workoutId, {
		create: true,
	});
	const handle = await parentDir.getFileHandle(`${sessionId}.json`, {
		create: true,
	});
	const writable = await handle.createWritable();

	await writable.write(JSON.stringify(session, null, 2));
	await writable.close();

	return session;
};
