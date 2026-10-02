import { createMemo } from "solid-js";
import { createWorkoutResource } from "./create-workout-resource";

export const createCurrentWorkout = (id: () => string) => {
	const { workouts } = createWorkoutResource();

	const currentWorkout = createMemo(() => {
		const data = workouts();
		if (!data) {
			return;
		}
		return data.find((workout) => workout.id === id());
	});

	return currentWorkout;
};
