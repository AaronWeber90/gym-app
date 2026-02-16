import { createResource } from "solid-js";

type WorkoutSession = {
	id: string;
	date: string;
};

type Workout = {
	id: string;
	name: string;
	created_at: string;
	lastTrainedAt: string | null;
	sessions: WorkoutSession[];
};

const getSessionsAndLastTrainedDate = async (
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
					const file = await fileHandle.getFile();
					const text = await file.text();
					const childWorkout = JSON.parse(text);
					const workoutDate = new Date(
						childWorkout.date || childWorkout.created_at,
					);

					// Add to sessions array
					sessions.push({
						id: childWorkout.id || fileName.replace(".json", ""),
						date: workoutDate.toISOString(),
						// Add other properties from childWorkout as needed
					});

					// Keep old logic for mostRecentDate
					if (!mostRecentDate || workoutDate > mostRecentDate) {
						mostRecentDate = workoutDate;
					}
				} catch (error) {
					console.warn("Failed to read child workout:", error);
				}
			}
		}

		// Sort sessions by date (newest first)
		sessions.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);

		return {
			lastTrainedAt: mostRecentDate?.toISOString() ?? null,
			sessions,
		};
	} catch (error) {
		// No child workouts directory exists yet
		return {
			lastTrainedAt: null,
			sessions: [],
		};
	}
};

const parseWorkoutFile = async (
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

const fetchWorkouts = async (): Promise<Workout[]> => {
	try {
		const root = await navigator.storage.getDirectory();
		const workoutsDir = await root.getDirectoryHandle("workouts", {
			create: true,
		});

		const workouts: Workout[] = [];

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
