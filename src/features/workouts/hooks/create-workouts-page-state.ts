import { createMemo, createSignal } from "solid-js";
import { createWorkoutResource } from "../../workout/hooks/create-workout-resource";

export const createWorkoutsPageState = () => {
	const { workouts, refetch } = createWorkoutResource();
	const [sortOrder, setSortOrder] = createSignal<"asc" | "desc">("asc");

	const sortedWorkouts = createMemo(() => {
		const items = workouts();
		if (!items || items.length === 0) return items;
		return items
			.slice()
			.sort((a, b) =>
				sortOrder() === "asc"
					? a.name.localeCompare(b.name)
					: b.name.localeCompare(a.name),
			);
	});

	const handleCreated = () => {
		refetch();
	};

	return { sortedWorkouts, sortOrder, setSortOrder, handleCreated };
};
