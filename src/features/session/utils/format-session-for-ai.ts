import { formatDate } from "../../../utils/format-date";
import type { ExerciseData, SessionData } from "./types";

const formatSet = (weight: number, reps: number, rpe?: number) => {
	const rpeSuffix = rpe != null ? `@${rpe}` : "";
	return `${weight}kgx${reps}${rpeSuffix}`;
};

const formatExercise = (exercise: ExerciseData, index: number) => {
	const name = exercise.name.trim() || `Übung ${index + 1}`;
	const sets = exercise.sets
		.map((set) => formatSet(set.weight, set.reps, set.rpe))
		.join(", ");

	return `${name}: ${sets || "-"}`;
};

export const formatSessionForAi = (
	session: Pick<SessionData, "name" | "date">,
	exercises: ExerciseData[],
) => {
	const title = `${session.name.trim() || "Session"} - ${formatDate(
		session.date,
		{
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		},
	)}`;

	if (exercises.length === 0) return `${title}\nKeine Übungen`;

	return `${title}\n${exercises
		.map((exercise, index) => formatExercise(exercise, index))
		.join("\n")}`;
};
