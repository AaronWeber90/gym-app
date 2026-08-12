export const normalizeExerciseName = (name: string): string =>
	name.trim().toLowerCase().replace(/\s+/g, " ");
