import type { ExerciseData } from "../../session/utils";

export type OverviewSession = {
	workoutId: string;
	workoutName: string;
	sessionId: string;
	date: string;
	exercises: ExerciseData[];
};

export type WeeklyInsights = {
	totalSessions: number;
	activeDays: number;
	totalVolume: number;
	averageSetsPerSession: number;
};

export type PersonalRecord = {
	exerciseName: string;
	weight: number;
	reps: number;
	date: string;
	workoutId: string;
	workoutName: string;
	sessionId: string;
};

const isInDateRange = (dateIso: string, start: Date, end: Date) => {
	const value = new Date(dateIso).getTime();
	if (Number.isNaN(value)) return false;

	const startAt = new Date(start);
	startAt.setHours(0, 0, 0, 0);

	const endAt = new Date(end);
	endAt.setHours(23, 59, 59, 999);

	return value >= startAt.getTime() && value <= endAt.getTime();
};

export const calculateWeeklyInsights = (
	sessions: OverviewSession[],
	start: Date,
	end: Date,
): WeeklyInsights => {
	const weeklySessions = sessions.filter((session) =>
		isInDateRange(session.date, start, end),
	);

	const activeDays = new Set(
		weeklySessions.map((session) => {
			const d = new Date(session.date);
			d.setHours(0, 0, 0, 0);
			return d.getTime();
		}),
	).size;

	const totalSets = weeklySessions.reduce((sum, session) => {
		return (
			sum +
			session.exercises.reduce((exerciseSum, exercise) => {
				return exerciseSum + exercise.sets.length;
			}, 0)
		);
	}, 0);

	const totalVolume = weeklySessions.reduce((sum, session) => {
		return (
			sum +
			session.exercises.reduce((exerciseSum, exercise) => {
				return (
					exerciseSum +
					exercise.sets.reduce((setSum, set) => {
						if (set.weight <= 0 || set.reps <= 0) return setSum;
						return setSum + set.weight * set.reps;
					}, 0)
				);
			}, 0)
		);
	}, 0);

	return {
		totalSessions: weeklySessions.length,
		activeDays,
		totalVolume,
		averageSetsPerSession:
			weeklySessions.length > 0 ? totalSets / weeklySessions.length : 0,
	};
};

export const calculatePersonalRecords = (
	sessions: OverviewSession[],
	limit = 5,
): PersonalRecord[] => {
	const byExercise = new Map<string, PersonalRecord>();

	for (const session of sessions) {
		for (const exercise of session.exercises) {
			const normalizedName = exercise.name.trim().toLowerCase();
			if (!normalizedName) continue;

			for (const set of exercise.sets) {
				if (set.weight <= 0 || set.reps <= 0) continue;

				const current: PersonalRecord = {
					exerciseName: exercise.name.trim(),
					weight: set.weight,
					reps: set.reps,
					date: session.date,
					workoutId: session.workoutId,
					workoutName: session.workoutName,
					sessionId: session.sessionId,
				};

				const previous = byExercise.get(normalizedName);
				if (!previous) {
					byExercise.set(normalizedName, current);
					continue;
				}

				const isBetterWeight = current.weight > previous.weight;
				const isSameWeightBetterReps =
					current.weight === previous.weight && current.reps > previous.reps;

				if (isBetterWeight || isSameWeightBetterReps) {
					byExercise.set(normalizedName, current);
				}
			}
		}
	}

	return [...byExercise.values()]
		.toSorted((a, b) => {
			if (a.weight !== b.weight) return b.weight - a.weight;
			if (a.reps !== b.reps) return b.reps - a.reps;
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		})
		.slice(0, Math.max(0, limit));
};
