import type { WorkoutSession } from "../../../api/types";

export const getSessionsAndLastTrainedDate = async (
	workoutId: string,
	workoutsDir: FileSystemDirectoryHandle,
) => {
	try {
		const childWorkoutsDir = await workoutsDir.getDirectoryHandle(workoutId, {
			create: false,
		});

		let mostRecentDate = null;
		const sessions: WorkoutSession[] = [];

		for await (const [fileName, fileHandle] of childWorkoutsDir.entries()) {
			if (fileHandle.kind === "file" && fileName.endsWith(".json")) {
				try {
					const file = await (fileHandle as FileSystemFileHandle).getFile();
					const text = await file.text();
					const childWorkout = JSON.parse(text);
					const workoutDate = new Date(
						childWorkout.date || childWorkout.created_at,
					);

					sessions.push({
						id: childWorkout.id || fileName.replace(".json", ""),
						date: workoutDate.toISOString(),
					});

					if (!mostRecentDate || workoutDate > mostRecentDate) {
						mostRecentDate = workoutDate;
					}
				} catch (error) {
					console.warn("Failed to read child workout:", error);
				}
			}
		}

		sessions.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);

		return {
			lastTrainedAt: mostRecentDate?.toISOString() ?? null,
			sessions,
		};
	} catch {
		return {
			lastTrainedAt: null,
			sessions: [],
		};
	}
};
