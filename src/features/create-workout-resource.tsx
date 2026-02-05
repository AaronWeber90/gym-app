import { createResource } from "solid-js";

const getLastTrainedDate = async (
	workoutId: string,
	workoutsDir: FileSystemDirectoryHandle,
) => {
	try {
		const childWorkoutsDir = await workoutsDir.getDirectoryHandle(workoutId, {
			create: false,
		});

		let mostRecentDate = null;

		for await (const [fileName, fileHandle] of childWorkoutsDir.entries()) {
			if (fileHandle.kind === "file" && fileName.endsWith(".json")) {
				try {
					const file = await fileHandle.getFile();
					const text = await file.text();
					const childWorkout = JSON.parse(text);
					const workoutDate = new Date(
						childWorkout.date || childWorkout.created_at,
					);

					if (!mostRecentDate || workoutDate > mostRecentDate) {
						mostRecentDate = workoutDate;
					}
				} catch (error) {
					console.warn("Failed to read child workout:", error);
				}
			}
		}

		return mostRecentDate?.toISOString() ?? null;
	} catch (error) {
		// No child workouts directory exists yet
		return null;
	}
};

const parseWorkoutFile = async (
	fileName: string,
	fileHandle: FileSystemFileHandle,
	workoutsDir: FileSystemDirectoryHandle,
) => {
	const file = await fileHandle.getFile();
	const text = await file.text();
	const workoutData = JSON.parse(text);

	const workoutId = workoutData.id ?? fileName.replace(".json", "");
	const lastTrainedAt = await getLastTrainedDate(workoutId, workoutsDir);

	return {
		id: workoutId,
		name: workoutData.name ?? "Unbenanntes Workout",
		created_at: workoutData.created_at ?? new Date().toISOString(),
		lastTrainedAt,
	};
};

const fetchWorkouts = async () => {
	try {
		const root = await navigator.storage.getDirectory();
		const workoutsDir = await root.getDirectoryHandle("workouts", {
			create: true,
		});

		const workouts = [];

		for await (const [fileName, fileHandle] of workoutsDir.entries()) {
			const isJsonFile =
				fileHandle.kind === "file" && fileName.endsWith(".json");

			if (isJsonFile) {
				const workout = await parseWorkoutFile(
					fileName,
					fileHandle,
					workoutsDir,
				);
				workouts.push(workout);
			}
		}

		const sortedWorkouts = workouts.sort((a, b) => {
			const dateA = new Date(a.created_at).getTime();
			const dateB = new Date(b.created_at).getTime();
			return dateB - dateA;
		});

		return sortedWorkouts;
	} catch (error) {
		console.error("Failed to read workouts from OPFS:", error);
		return [];
	}
};

export const createWorkoutResource = () => {
	const [workouts, { refetch }] = createResource(fetchWorkouts);
	return { workouts, refetch };
};
