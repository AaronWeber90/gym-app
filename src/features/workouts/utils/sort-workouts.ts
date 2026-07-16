import type { Workout } from "../../../api/types";

export type WorkoutsSortMode = "asc" | "desc" | "oldest";

export const sortWorkouts = (items: Workout[], mode: WorkoutsSortMode) => {
	const sorted = [...items];

	return sorted.sort((a, b) => {
		if (mode === "oldest") {
			const aLastTrainedAt = a.lastTrainedAt
				? new Date(a.lastTrainedAt).getTime()
				: Number.POSITIVE_INFINITY;
			const bLastTrainedAt = b.lastTrainedAt
				? new Date(b.lastTrainedAt).getTime()
				: Number.POSITIVE_INFINITY;

			return aLastTrainedAt - bLastTrainedAt;
		}

		return mode === "asc"
			? a.name.localeCompare(b.name)
			: b.name.localeCompare(a.name);
	});
};
