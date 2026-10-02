import type { SessionData, WorkoutSessionSummary } from "@api";
import { getDir } from "./get-dir";
import { getRootDir } from "./get-root-dir";

export const getWorkoutSessions = async (
	workoutId: string,
): Promise<WorkoutSessionSummary[]> => {
	try {
		const root = await getRootDir();
		const workoutsDir = await getDir(root, "workouts", true);
		const workoutDir = await getDir(workoutsDir, workoutId, false);
		const sessions: WorkoutSessionSummary[] = [];

		for await (const [name, handle] of workoutDir.entries()) {
			if (handle.kind !== "file" || !name.endsWith(".json")) {
				continue;
			}
			try {
				const file = await (handle as FileSystemFileHandle).getFile();
				const session = JSON.parse(await file.text()) as SessionData;
				const id = name.replace(".json", "");
				const normalizedSession = { ...session, id };
				sessions.push({
					id,
					name: normalizedSession.name ?? "Unbenannt",
					date: normalizedSession.date,
					created_at: normalizedSession.created_at,
					session: normalizedSession,
				});
			} catch (error) {
				console.warn("Failed to read workout session:", error);
			}
		}

		return sessions.toSorted(
			(a, b) =>
				new Date(b.created_at ?? 0).getTime() -
				new Date(a.created_at ?? 0).getTime(),
		);
	} catch (error) {
		console.error("Failed to load workout sessions:", error);
		return [];
	}
};
