import { createQuery } from "@tanstack/solid-query";
import { createMemo, createSignal } from "solid-js";
import { createWorkoutResource } from "../../workout/hooks/create-workout-resource";
import { buildWeekDays } from "../utils/build-week-days";
import {
	calculatePersonalRecords,
	calculateWeeklyInsights,
} from "../utils/calculate-overview-insights";
import {
	fetchOverviewSessions,
	overviewSessionsQueryKey,
} from "../utils/fetch-overview-sessions";
import { formatWeekRange } from "../utils/format-week-range";
import { getWeekStart } from "../utils/get-week-start";
import { isToday } from "../utils/is-today";

export const createOverviewPageState = () => {
	const { workouts } = createWorkoutResource();
	const [weekOffset, setWeekOffset] = createSignal(0);

	const overviewSessionsQuery = createQuery(() => ({
		queryKey: overviewSessionsQueryKey,
		queryFn: fetchOverviewSessions,
	}));

	const weekDays = createMemo(() => {
		const today = new Date();
		const weekStart = getWeekStart(today);
		weekStart.setDate(weekStart.getDate() + weekOffset() * 7);
		return buildWeekDays(weekStart, workouts() ?? []);
	});

	const weekRange = createMemo(() => formatWeekRange(weekDays()));

	const weeklyInsights = createMemo(() => {
		const sessions = overviewSessionsQuery.data ?? [];
		const days = weekDays();
		if (days.length === 0) {
			return {
				totalSessions: 0,
				activeDays: 0,
				totalVolume: 0,
				averageSetsPerSession: 0,
			};
		}
		return calculateWeeklyInsights(sessions, days[0].date, days[6].date);
	});

	const personalRecords = createMemo(() =>
		calculatePersonalRecords(overviewSessionsQuery.data ?? [], 5),
	);

	const previousWeek = () => setWeekOffset((o) => o - 1);
	const nextWeek = () => setWeekOffset((o) => o + 1);
	const goToToday = () => setWeekOffset(0);

	return {
		weekDays,
		weekRange,
		weeklyInsights,
		personalRecords,
		previousWeek,
		nextWeek,
		goToToday,
		isToday,
	};
};
