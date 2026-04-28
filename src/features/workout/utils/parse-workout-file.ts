import type { Workout } from "../../../api/types";
import { getSessionsAndLastTrainedDate } from "./get-sessions-and-last-trained-date";

export const parseWorkoutFile = async (
	fileName: string,
	fileHandle: FileSystemFileHandle,
	workoutsDir: FileSystemDirectoryHandle,
): Promise<Workout> => {
	const file = await fileHandle.getFile();
	const text = await file.text();
	const workoutData = JSON.parse(text);

	const workoutId = workoutData.id ?? fileName.replace(".json", "");
	const { lastTrainedAt, sessions } = await getSessionsAndLastTrainedDate(
		workoutId,
		workoutsDir,
	);

	return {
		id: workoutId,
		name: workoutData.name,
		created_at: workoutData.created_at ?? new Date().toISOString(),
		lastTrainedAt,
		sessions,
	};
};
