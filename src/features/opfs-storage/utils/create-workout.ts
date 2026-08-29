import type { CreateWorkoutInput, Workout } from "@api";
import { getDir } from "./get-dir";
import { getFile } from "./get-file";
import { getRootDir } from "./get-root-dir";

export const createWorkout = async (
	input: CreateWorkoutInput,
): Promise<Workout> => {
	const root = await getRootDir();
	const workoutsDir = await getDir(root, "workouts", true);
	const id = crypto.randomUUID();
	const createdAt = new Date().toISOString();
	const handle = await getFile(workoutsDir, `${id}.json`, true);
	const writable = await handle.createWritable();

	await writable.write(
		JSON.stringify({ id, name: input.name, created_at: createdAt }, null, 2),
	);
	await writable.close();

	return {
		id,
		name: input.name,
		created_at: createdAt,
		lastTrainedAt: null,
		sessions: [],
	};
};
