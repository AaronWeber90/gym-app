import { createResource } from "solid-js";

const fetchWorkouts = async () => {
	try {
		const root = await navigator.storage.getDirectory();
		const workoutsDir = await root.getDirectoryHandle("workouts", {
			create: true,
		});
		const workouts = [];

		for await (const [name, handle] of workoutsDir.entries()) {
			if (handle.kind === "file" && name.endsWith(".json")) {
				const file = await handle.getFile();
				const text = await file.text();
				const data = JSON.parse(text);
				
				// Fetch the most recent child workout date
				let lastTrainedDate = null;
				try {
					const workoutId = data.id ?? name.replace(".json", "");
					const parentDir = await workoutsDir.getDirectoryHandle(workoutId, {
						create: false,
					});
					
					for await (const [childName, childHandle] of parentDir.entries()) {
						if (childHandle.kind === "file" && childName.endsWith(".json")) {
							try {
								const childFile = await childHandle.getFile();
								const childText = await childFile.text();
								const childData = JSON.parse(childText);
								const childDate = new Date(childData.date || childData.created_at);
								
								if (!lastTrainedDate || childDate > lastTrainedDate) {
									lastTrainedDate = childDate;
								}
							} catch (err) {
								console.warn("Failed to read child workout:", err);
							}
						}
					}
				} catch (err) {
					// No child workouts yet
				}
				
				workouts.push({
					id: data.id ?? name.replace(".json", ""),
					name: data.name ?? "Unbenanntes Workout",
					created_at: data.created_at ?? new Date().toISOString(),
					lastTrainedAt: lastTrainedDate?.toISOString() ?? null,
				});
			}
		}

		return workouts.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		);
	} catch (err) {
		console.error("Failed to read workouts from OPFS:", err);
		return [];
	}
};

export const createWorkoutResource = () => {
	const [workouts, { refetch }] = createResource(fetchWorkouts);
	return { workouts, refetch };
};
