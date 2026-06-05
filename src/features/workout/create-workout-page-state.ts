import { useNavigate, useParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { createMemo } from "solid-js";
import { overviewSessionsQueryKey } from "../overview/utils/fetch-overview-sessions";
import { createChildWorkoutsResource } from "./create-child-workouts-resource";
import { createCurrentWorkout } from "./create-current-workout";
import { workoutsQueryKey } from "./create-workout-resource";
import { deleteWorkout } from "./delete-workout";

export const createWorkoutPageState = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const params = useParams<{ id: string }>();

	const currentWorkout = createCurrentWorkout(() => params.id);
	const { childWorkouts, refetch: refetchChildWorkouts } =
		createChildWorkoutsResource(() => params.id);

	const latestExercises = createMemo(() => {
		const sessions = childWorkouts();
		if (!sessions?.length) return undefined;
		const latestId = sessions[0].id;
		const cached = queryClient.getQueryData<{ exercises?: unknown[] }>([
			"workoutSession",
			params.id,
			latestId,
		]);
		if (!cached?.exercises?.length) return undefined;
		return cached.exercises as {
			name: string;
			sets: { weight: number; reps: number }[];
		}[];
	});

	const handleDelete = async () => {
		try {
			await deleteWorkout(params.id);
			navigate("/workouts");
		} catch (err) {
			console.error("Failed to delete workout:", err);
		}
	};

	const handleSessionSaved = async () => {
		await refetchChildWorkouts();
		await queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
		await queryClient.invalidateQueries({ queryKey: overviewSessionsQueryKey });
	};

	return {
		currentWorkout,
		childWorkouts,
		latestExercises,
		handleDelete,
		handleSessionSaved,
		workoutId: () => params.id,
	};
};
