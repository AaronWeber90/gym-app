import { A } from "@solidjs/router";
import { createMemo, createSignal, For } from "solid-js";
import { createWorkoutResource } from "../features/create-workout-resource";
import { Header } from "../features/workouts/header";

interface WeekDay {
	date: Date;
	dayName: string;
	workouts: Array<{ id: string; name: string }>;
}

const WorkoutCalendar = () => {
	const { workouts } = createWorkoutResource();
	const [weekOffset, setWeekOffset] = createSignal(0);

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
	];

	const weekDayNames = [
		"Montag",
		"Dienstag",
		"Mittwoch",
		"Donnerstag",
		"Freitag",
		"Samstag",
		"Sonntag",
	];

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

			const dayWorkouts =
				workouts()
					?.filter((w) => {
						if (!w.lastTrainedAt) return false;
						const trainedDate = new Date(w.lastTrainedAt);
						return (
							trainedDate.getDate() === date.getDate() &&
							trainedDate.getMonth() === date.getMonth() &&
							trainedDate.getFullYear() === date.getFullYear()
						);
					})
					.map((w) => ({ id: w.id, name: w.name })) || [];

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

	const totalWorkoutsThisWeek = createMemo(() => {
		return weekDays().reduce((sum, day) => sum + day.workouts.length, 0);
	});

	const activeDaysThisWeek = createMemo(() => {
		return weekDays().filter((day) => day.workouts.length > 0).length;
	});

	return (
		<>
			<Header />
			<div class="p-4 max-w-2xl mx-auto">
				{/* Navigation */}
				<div class="mb-6">
					<div class="flex items-center justify-between mb-3">
						<h2 class="text-xl font-bold tracking-tight">{weekRange()}</h2>
						<div class="flex gap-2">
							<button
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
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<button onClick={goToToday} class="btn btn-sm btn-primary">
								Heute
							</button>
							<button
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
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					</div>

					{/* Quick Stats */}
					<div class="grid grid-cols-2 gap-3">
						<div class="bg-base-200 rounded-lg p-3">
							<div class="text-xs text-base-content/60 font-medium">
								Diese Woche
							</div>
							<div class="text-2xl font-bold text-primary">
								{totalWorkoutsThisWeek()}
							</div>
							<div class="text-xs text-base-content/50">Trainings</div>
						</div>
						<div class="bg-base-200 rounded-lg p-3">
							<div class="text-xs text-base-content/60 font-medium">
								Aktive Tage
							</div>
							<div class="text-2xl font-bold text-secondary">
								{activeDaysThisWeek()}
							</div>
							<div class="text-xs text-base-content/50">von 7 Tagen</div>
						</div>
					</div>
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
													<A href={`/workouts/${workout.id}`} class="block">
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
										<div class="text-center py-4 text-base-content/40 text-sm">
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
