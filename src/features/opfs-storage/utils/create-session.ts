import type { CreateSessionInput, SessionData } from "@api";
import { getDir } from "./get-dir";
import { getFile } from "./get-file";
import { getRootDir } from "./get-root-dir";

export const createSession = async (
	input: CreateSessionInput,
): Promise<SessionData> => {
	const root = await getRootDir();
	const workoutsDir = await getDir(root, "workouts", true);
	const workoutDir = await getDir(workoutsDir, input.workoutId, true);
	const id = crypto.randomUUID();
	const now = new Date().toISOString();
	const session: SessionData = {
		id,
		parentId: input.workoutId,
		name: "",
		date: now,
		created_at: now,
		exercises: input.exercises,
	};
	const handle = await getFile(workoutDir, `${id}.json`, true);
	const writable = await handle.createWritable();

	await writable.write(JSON.stringify(session, null, 2));
	await writable.close();

	return session;
};
