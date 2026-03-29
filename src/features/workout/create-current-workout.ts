import { createMemo } from "solid-js";
import { createWorkoutResource } from "../create-workout-resource";

export const createCurrentWorkout = (id: () => string) => {
	const { workouts } = createWorkoutResource();

	const currentWorkout = createMemo(() => {
		const data = workouts();
		if (!data) return undefined;
		return data.find((workout) => workout.id === id());
	});

	return currentWorkout;
};
