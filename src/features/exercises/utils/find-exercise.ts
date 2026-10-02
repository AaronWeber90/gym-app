import { type CatalogExercise, EXERCISE_CATALOG } from "./exercise-catalog";
import { normalizeExerciseName } from "./normalize-exercise-name";

export const findExercise = (name: string): CatalogExercise | undefined => {
	const normalized = normalizeExerciseName(name);

	return EXERCISE_CATALOG.find((exercise) =>
		[exercise.name, ...(exercise.aliases ?? [])].some(
			(candidate) => normalizeExerciseName(candidate) === normalized,
		),
	);
};

export const getExerciseSuggestions = (): string[] =>
	EXERCISE_CATALOG.map((ex) => ex.name);
