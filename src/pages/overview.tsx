import { A } from "@solidjs/router";
import { For } from "solid-js";
import { WeeklyStats } from "../features/overview/components/weekly-stats";
import { createOverviewPageState } from "../features/overview/hooks/create-overview-page-state";
import { monthNames } from "../features/overview/utils/constants";
import { Header } from "../features/workouts/components/header";
import { Button } from "../ui/button";
import { Section } from "../ui/section";
import { formatDate } from "../utils/format-date";

const WorkoutCalendar = () => {
	const {
		weekDays,
		weekRange,
		weeklyInsights,
		personalRecords,
		previousWeek,
		nextWeek,
		goToToday,
		isToday,
	} = createOverviewPageState();

	return (
		<>
			<Header title="Übersicht" />
			<div class="mx-auto flex flex-col gap-4">
				{/* Week Navigation Section */}
				<Section title="Wochenübersicht">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-xl font-bold tracking-tight">{weekRange()}</h3>
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
				</Section>

				{/* Personal Records Section */}
				<Section title="Persönliche Rekorde" subtitle="Nach Gewicht">
					{personalRecords().length > 0 ? (
						<div class="space-y-2">
							<For each={personalRecords()}>
								{(record) => (
									<A
										href={`/workouts/${record.workoutId}/${record.sessionId}`}
										class="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-base-300/30 transition-colors"
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
				</Section>

				{/* Week Days Section */}
				<Section title="Trainingsplan">
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
				</Section>
			</div>
		</>
	);
};

export default WorkoutCalendar;
