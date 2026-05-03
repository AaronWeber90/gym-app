import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { getDir, getRootDir } from "../opfs-storage/utils";

type ChildWorkout = {
	id: string;
	name: string;
	date: string;
	created_at: string;
};

export const childWorkoutsQueryKey = (parentId: string) =>
	["childWorkouts", parentId] as const;

export const createChildWorkoutsResource = (parentId: () => string) => {
	const queryClient = useQueryClient();

	const fetchChildWorkouts = async (): Promise<ChildWorkout[]> => {
		const id = parentId();
		if (!id) return [];
		try {
			const root = await getRootDir();
			const workoutsDir = await getDir(root, "workouts", true);
			const parentDir = await workoutsDir.getDirectoryHandle(id, {
				create: false,
			});
			const result: ChildWorkout[] = [];
			for await (const [name, handle] of parentDir.entries()) {
				if (handle.kind === "file" && name.endsWith(".json")) {
					try {
						const file = await (handle as FileSystemFileHandle).getFile();
						const text = await file.text();
						const data = JSON.parse(text);
						const sessionId = data.id ?? name.replace(".json", "");

						// Seed session query cache so navigation is instant
						queryClient.setQueryData(["workoutSession", id, sessionId], data);

						result.push({
							id: sessionId,
							name: data.name ?? "Unbenannt",
							date: data.date,
							created_at: data.created_at,
						});
					} catch (err) {
						console.warn("Failed to read child workout:", err);
					}
				}
			}
			return result.toSorted(
				(a, b) =>
					new Date(b.created_at ?? 0).getTime() -
					new Date(a.created_at ?? 0).getTime(),
			);
		} catch (err) {
			console.error("Failed to load child workouts:", err);
			return [];
		}
	};

	const childWorkoutsQuery = createQuery(() => ({
		queryKey: childWorkoutsQueryKey(parentId()),
		queryFn: fetchChildWorkouts,
		enabled: !!parentId(),
		throwOnError: true,
	}));

	return {
		childWorkouts: () => childWorkoutsQuery.data,
		refetch: () =>
			queryClient.invalidateQueries({
				queryKey: childWorkoutsQueryKey(parentId()),
			}),
	};
};
