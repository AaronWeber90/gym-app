import type { ExerciseData } from "./types";

export const mapSessionExercises = (
	exercises: ExerciseData[],
): ExerciseData[] =>
	exercises.map((ex) => ({
		name: ex.name,
		sets: Array.isArray(ex.sets)
			? ex.sets.map((set) => ({
					weight: set.weight,
					reps: set.reps,
					...(set.rpe != null ? { rpe: set.rpe } : {}),
				}))
			: Array.from({ length: Number(ex.sets) || 1 }, () => ({
					weight: 0,
					reps: 1,
				})),
	}));

export const appendSet = (list: ExerciseData[], exIndex: number) => {
	const lastSet = list[exIndex]?.sets.at(-1);
	const newSet = lastSet
		? { weight: lastSet.weight, reps: lastSet.reps }
		: { weight: 0, reps: 1 };
	return list.map((ex, i) =>
		i === exIndex ? { ...ex, sets: [...ex.sets, newSet] } : ex,
	);
};
