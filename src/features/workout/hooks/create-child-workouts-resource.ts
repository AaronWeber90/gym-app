import { dataClient } from "@api";
import { createQuery, useQueryClient } from "@tanstack/solid-query";

export const childWorkoutsQueryKey = (parentId: string) =>
	["childWorkouts", parentId] as const;

export const createChildWorkoutsResource = (parentId: () => string) => {
	const queryClient = useQueryClient();

	const fetchChildWorkouts = async () => {
		const id = parentId();
		if (!id) {
			return [];
		}
		const sessions = await dataClient.getWorkoutSessions(id);
		for (const session of sessions) {
			queryClient.setQueryData(
				["workoutSession", id, session.id],
				session.session,
			);
		}
		return sessions;
	};

	const childWorkoutsQuery = createQuery(() => ({
		queryKey: childWorkoutsQueryKey(parentId()),
		queryFn: fetchChildWorkouts,
		enabled: Boolean(parentId()),
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
