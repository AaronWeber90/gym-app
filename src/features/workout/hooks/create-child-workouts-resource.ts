import {
	createQuery,
	type QueryClient,
	useQueryClient,
} from "@tanstack/solid-query";
import { getDir, getRootDir } from "../../opfs-storage/utils";

type ChildWorkout = {
	id: string;
	name: string;
	date: string;
	created_at: string;
};

export const childWorkoutsQueryKey = (parentId: string) =>
	["childWorkouts", parentId] as const;

const readChildWorkout = async (
	name: string,
	handle: FileSystemHandle,
	parentId: string,
	queryClient: QueryClient,
): Promise<ChildWorkout | null> => {
	if (handle.kind !== "file" || !name.endsWith(".json")) return null;
	try {
		const file = await (handle as FileSystemFileHandle).getFile();
		const text = await file.text();
		const data = JSON.parse(text);
		const sessionId = name.replace(".json", "");
		const normalizedData = { ...data, id: sessionId };

		// Seed session query cache so navigation is instant
		queryClient.setQueryData(
			["workoutSession", parentId, sessionId],
			normalizedData,
		);

		return {
			id: sessionId,
			name: normalizedData.name ?? "Unbenannt",
			date: normalizedData.date,
			created_at: normalizedData.created_at,
		};
	} catch (err) {
		console.warn("Failed to read child workout:", err);
		return null;
	}
};

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
				const entry = await readChildWorkout(name, handle, id, queryClient);
				if (entry) result.push(entry);
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
