import type { Workout } from "../../../api/types";
import { weekDayNames } from "./constants";
import type { DayWorkout, WeekDay } from "./types";

export function buildWeekDays(weekStart: Date, workouts: Workout[]): WeekDay[] {
	const days: WeekDay[] = [];

	for (let i = 0; i < 7; i++) {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + i);

		const dayWorkouts: DayWorkout[] = workouts
			.flatMap((w) => {
				if (!w.sessions || w.sessions.length === 0) return [];
				return w.sessions
					.filter((session) => {
						const sessionDate = new Date(session.date);
						return (
							sessionDate.getDate() === date.getDate() &&
							sessionDate.getMonth() === date.getMonth() &&
							sessionDate.getFullYear() === date.getFullYear()
						);
					})
					.map((session) => ({
						id: w.id,
						name: w.name,
						sessionId: session.id,
						timestamp: session.date,
					}));
			})
			.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			);

		days.push({ date, dayName: weekDayNames[i], workouts: dayWorkouts });
	}

	return days;
}
