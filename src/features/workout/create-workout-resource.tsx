import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { fetchWorkouts } from "./utils/fetch-workouts";

export const workoutsQueryKey = ["workouts"] as const;

export const createWorkoutResource = () => {
	const queryClient = useQueryClient();
	const workoutsQuery = useQuery(() => ({
		queryKey: workoutsQueryKey,
		queryFn: fetchWorkouts,
		throwOnError: true,
	}));
	return {
		workouts: () => workoutsQuery.data,
		error: () => workoutsQuery.error,
		isLoading: () => workoutsQuery.isLoading,
		refetch: () =>
			queryClient.invalidateQueries({ queryKey: workoutsQueryKey }),
	};
};
