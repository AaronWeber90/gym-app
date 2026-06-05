import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { createMemo, createSignal, For } from "solid-js";
import { WeeklyStats } from "../features/overview/components/weekly-stats";
import {
	calculatePersonalRecords,
	calculateWeeklyInsights,
} from "../features/overview/utils/calculate-overview-insights";
import {
	fetchOverviewSessions,
	overviewSessionsQueryKey,
} from "../features/overview/utils/fetch-overview-sessions";
import { createWorkoutResource } from "../features/workout/create-workout-resource";
import { Header } from "../features/workouts/components/header";
import { Button } from "../ui/button";
import { formatDate } from "../utils/format-date";

type WorkoutSession = {
	id: string;
	name: string;
	sessionId: string;
	timestamp: string;
};

type WeekDay = {
	date: Date;
	dayName: string;
	workouts: WorkoutSession[];
};

const monthNames = [
	"Januar",
	"Februar",
	"März",
	"April",
	"Mai",
	"Juni",
	"Juli",
	"August",
	"September",
	"Oktober",
	"November",
	"Dezember",
] as const;

const weekDayNames = [
	"Montag",
	"Dienstag",
	"Mittwoch",
	"Donnerstag",
	"Freitag",
	"Samstag",
	"Sonntag",
] as const;

const WorkoutCalendar = () => {
	const { workouts } = createWorkoutResource();
	const [weekOffset, setWeekOffset] = createSignal(0);

	const overviewSessionsQuery = createQuery(() => ({
		queryKey: overviewSessionsQueryKey,
		queryFn: fetchOverviewSessions,
	}));

	// Get the start of the week (Monday)
	const getWeekStart = (date: Date) => {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
		return new Date(d.setDate(diff));
	};

	// Get current week days
	const weekDays = createMemo(() => {
		const today = new Date();
		const offset = weekOffset();

		// Get start of current week and add offset
		const weekStart = getWeekStart(today);
		weekStart.setDate(weekStart.getDate() + offset * 7);

		const days: WeekDay[] = [];

		for (let i = 0; i < 7; i++) {
			const date = new Date(weekStart);
			date.setDate(weekStart.getDate() + i);

			// NEW: Use sessions instead of lastTrainedAt
			const dayWorkouts =
				workouts()
					?.flatMap((w) => {
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
					) || [];

			days.push({
				date,
				dayName: weekDayNames[i],
				workouts: dayWorkouts,
			});
		}

		return days;
	});

	const weekRange = createMemo(() => {
		const days = weekDays();
		if (days.length === 0) return "";

		const start = days[0].date;
		const end = days[6].date;

		// If same month
		if (start.getMonth() === end.getMonth()) {
			return `${start.getDate()}. - ${end.getDate()}. ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
		}
		// Different months
		return `${start.getDate()}. ${monthNames[start.getMonth()]} - ${end.getDate()}. ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
	});

	const previousWeek = () => {
		setWeekOffset((o) => o - 1);
	};

	const nextWeek = () => {
		setWeekOffset((o) => o + 1);
	};

	const goToToday = () => {
		setWeekOffset(0);
	};

	const today = new Date();
	const isToday = (date: Date) => {
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	};

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

	const personalRecords = createMemo(() => {
		const sessions = overviewSessionsQuery.data ?? [];
		return calculatePersonalRecords(sessions, 5);
	});

	return (
		<>
			<Header title="Übersicht" />
			<div class="mx-auto">
				{/* Navigation */}
				<div class="mb-6">
					<div class="flex items-center justify-between mb-3">
						<h2 class="text-xl font-bold tracking-tight">{weekRange()}</h2>
						<div class="flex gap-2">
							<Button
								onClick={previousWeek}
								class="btn btn-sm btn-ghost"
								aria-label="Vorherige Woche"
							>
								<svg
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Vorherige Woche</title>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</Button>
							<Button onClick={goToToday} class="btn btn-sm btn-primary">
								Heute
							</Button>
							<Button
								onClick={nextWeek}
								class="btn btn-sm btn-ghost"
								aria-label="Nächste Woche"
							>
								<svg
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Nächste Woche</title>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</Button>
						</div>
					</div>

					{/* Quick Stats */}
					<WeeklyStats insights={weeklyInsights()} />
				</div>

				<div class="mb-6 bg-base-200 rounded-xl p-4">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-lg font-semibold">Persönliche Rekorde</h3>
						<div class="text-xs text-base-content/60">Nach Gewicht</div>
					</div>
					{personalRecords().length > 0 ? (
						<div class="space-y-2">
							<For each={personalRecords()}>
								{(record) => (
									<A
										href={`/workouts/${record.workoutId}/${record.sessionId}`}
										class="flex items-center justify-between p-3 rounded-lg bg-base-100 hover:bg-base-300/30 transition-colors"
									>
										<div class="min-w-0">
											<div class="font-medium truncate">
												{record.exerciseName}
											</div>
											<div class="text-xs text-base-content/60 truncate">
												{record.workoutName} •{" "}
												{formatDate(record.date, {
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
												})}
											</div>
										</div>
										<div class="text-right ml-4">
											<div class="font-bold text-primary">
												{record.weight} kg
											</div>
											<div class="text-xs text-base-content/60">
												{record.reps} Wiederholungen
											</div>
										</div>
									</A>
								)}
							</For>
						</div>
					) : (
						<div class="text-sm text-base-content/50">
							Noch keine Rekorde vorhanden.
						</div>
					)}
				</div>

				{/* Week Days - Column Layout */}
				<div class="space-y-3">
					<For each={weekDays()}>
						{(day) => (
							<div
								class={`bg-base-100 rounded-xl border-2 transition-all ${
									isToday(day.date)
										? "border-primary shadow-lg shadow-primary/20"
										: "border-base-300 hover:border-base-400"
								}`}
							>
								{/* Day Header */}
								<div
									class={`p-4 border-b ${
										isToday(day.date)
											? "border-primary/20 bg-primary/5"
											: "border-base-300"
									}`}
								>
									<div class="flex items-center justify-between">
										<div>
											<div
												class={`text-sm font-semibold ${
													isToday(day.date)
														? "text-primary"
														: "text-base-content/60"
												}`}
											>
												{day.dayName}
											</div>
											<div
												class={`text-2xl font-bold ${
													isToday(day.date)
														? "text-primary"
														: "text-base-content"
												}`}
											>
												{day.date.getDate()}
											</div>
										</div>
										<div class="text-right">
											<div class="text-xs text-base-content/50">
												{monthNames[day.date.getMonth()]}
											</div>
											{isToday(day.date) && (
												<div class="badge badge-primary badge-sm mt-1">
													Heute
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Workouts */}
								<div class="p-4">
									{day.workouts.length > 0 ? (
										<div class="space-y-2">
											<For each={day.workouts}>
												{(workout) => (
													<A
														href={`/workouts/${workout.id}/${workout.sessionId}`}
														class="block"
													>
														<div class="flex items-center gap-3 p-3 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors group">
															<div class="w-2 h-2 bg-primary-content rounded-full flex-shrink-0"></div>
															<div class="font-medium text-sm flex-1 min-w-0">
																{workout.name}
															</div>
															<svg
																class="w-5 h-5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<title>Zum Workout</title>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M9 5l7 7-7 7"
																/>
															</svg>
														</div>
													</A>
												)}
											</For>
										</div>
									) : (
										<div class="text-center text-base-content/40 text-sm">
											Kein Training
										</div>
									)}
								</div>
							</div>
						)}
					</For>
				</div>
			</div>
		</>
	);
};

export default WorkoutCalendar;
