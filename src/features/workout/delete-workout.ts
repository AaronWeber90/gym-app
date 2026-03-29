import { getDir, getRootDir } from "../opfs-storage/utils";

export const deleteWorkout = async (workoutId: string) => {
	const root = await getRootDir();
	const workoutsDir = await getDir(root, "workouts", false);

	// Delete the directory containing child workouts (if it exists)
	try {
		await workoutsDir.removeEntry(workoutId, { recursive: true });
	} catch (err) {
		// Directory might not exist if no child workouts were created
		console.warn("Child workouts directory not found or already deleted:", err);
	}

	// Delete the parent workout JSON file
	await workoutsDir.removeEntry(`${workoutId}.json`);
};
