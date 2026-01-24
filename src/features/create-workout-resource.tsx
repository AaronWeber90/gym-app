import { createResource } from "solid-js";

    const fetchWorkouts = async () => {
        try {
            const root = await navigator.storage.getDirectory();
            const workoutsDir = await root.getDirectoryHandle("workouts", { create: true });
            const workouts = [];

            for await (const [name, handle] of workoutsDir.entries()) {
                if (handle.kind === "file" && name.endsWith(".json")) {
                    const file = await handle.getFile();
                    const text = await file.text();
                    const data = JSON.parse(text);
                    workouts.push({
                        id: data.id ?? name.replace(".json", ""),
                        name: data.name ?? "Unbenanntes Workout",
                        created_at: data.created_at ?? new Date().toISOString(),
                    });
                }
            }

            return workouts.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        } catch (err) {
            console.error("Failed to read workouts from OPFS:", err);
            return [];
        }
    };

export const createWorkoutResource = () => {

        const [workouts, { refetch }] = createResource(fetchWorkouts);
    return { workouts, refetch };
}