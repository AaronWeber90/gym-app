import { createMemo, createSignal } from "solid-js";
import { createWorkoutResource } from "../../workout/hooks/create-workout-resource";
import { sortWorkouts, type WorkoutsSortMode } from "../utils/sort-workouts";

export const createWorkoutsPageState = () => {
	const { workouts, refetch } = createWorkoutResource();
	const [sortOrder, setSortOrder] = createSignal<WorkoutsSortMode>("asc");

	const sortedWorkouts = createMemo(() => {
		const items = workouts();
		if (!items || items.length === 0) return items;
		return sortWorkouts(items, sortOrder());
	});

	const handleCreated = () => {
		refetch();
	};

	return { sortedWorkouts, sortOrder, setSortOrder, handleCreated };
};
