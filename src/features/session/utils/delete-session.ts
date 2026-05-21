import { getRootDir } from "../../opfs-storage/utils";

export const deleteSession = async (workoutId: string, sessionId: string) => {
	const root = await getRootDir();
	const workoutsDir = await root.getDirectoryHandle("workouts", {
		create: true,
	});
	const parentDir = await workoutsDir.getDirectoryHandle(workoutId, {
		create: true,
	});

	await parentDir.removeEntry(`${sessionId}.json`);
};