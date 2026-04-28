import type { Workout } from "../../../api/types";
import { getDir, getRootDir } from "../../opfs-storage/utils";
import { parseWorkoutFile } from "./parse-workout-file";

export const fetchWorkouts = async (): Promise<Workout[]> => {
	try {
		const root = await getRootDir();
		const workoutsDir = await getDir(root, "workouts", true);

		const workouts: Workout[] = [];

		for await (const [fileName, fileHandle] of workoutsDir.entries()) {
			const isJsonFile =
				fileHandle.kind === "file" && fileName.endsWith(".json");

			if (isJsonFile) {
				const workout = await parseWorkoutFile(
					fileName,
					fileHandle as FileSystemFileHandle,
					workoutsDir,
				);
				workouts.push(workout);
			}
		}

		return workouts.toSorted((a, b) => {
			const dateA = new Date(a.created_at).getTime();
			const dateB = new Date(b.created_at).getTime();
			return dateB - dateA;
		});
	} catch (error) {
		console.error("Failed to read workouts from OPFS:", error);
		return [];
	}
};
