import { type CatalogExercise, EXERCISE_CATALOG } from "./exercise-catalog";
import { normalizeExerciseName } from "./normalize-exercise-name";

export const findExercise = (name: string): CatalogExercise | undefined => {
	const normalized = normalizeExerciseName(name);

	for (const exercise of EXERCISE_CATALOG) {
		if (normalizeExerciseName(exercise.name) === normalized) {
			return exercise;
		}
		if (exercise.aliases) {
			for (const alias of exercise.aliases) {
				if (normalizeExerciseName(alias) === normalized) {
					return exercise;
				}
			}
		}
	}

	return undefined;
};

export const getExerciseSuggestions = (): string[] =>
	EXERCISE_CATALOG.map((ex) => ex.name);
