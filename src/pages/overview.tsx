import { A } from "@solidjs/router";
import { For } from "solid-js";
import { WeeklyStats } from "../features/overview/components/weekly-stats";
import { createOverviewPageState } from "../features/overview/hooks/create-overview-page-state";
import { monthNames } from "../features/overview/utils/constants";
import { Header } from "../features/workouts/components/header";
import { Button } from "../ui/button";
import { Section } from "../ui/section";
import { formatDate } from "../utils/format-date";

type OverviewState = ReturnType<typeof createOverviewPageState>;
type WeekDay = ReturnType<OverviewState["weekDays"]>[number];
type WorkoutEntry = WeekDay["workouts"][number];
type PersonalRecord = ReturnType<OverviewState["personalRecords"]>[number];

const WeekNavigationSection = (props: {
	weekRange: OverviewState["weekRange"];
	weeklyInsights: OverviewState["weeklyInsights"];
	previousWeek: OverviewState["previousWeek"];
	nextWeek: OverviewState["nextWeek"];
	goToToday: OverviewState["goToToday"];
}) => (
	<Section title="Wochenübersicht">
		<div class="flex items-center justify-between mb-3">
			<h3 class="text-xl font-bold tracking-tight">{props.weekRange()}</h3>
			<div class="flex gap-2">
				<Button
					onClick={props.previousWeek}
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
				<Button onClick={props.goToToday} class="btn btn-sm btn-primary">
					Heute
				</Button>
				<Button
					onClick={props.nextWeek}
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
		<WeeklyStats insights={props.weeklyInsights()} />
	</Section>
);

const PersonalRecordItem = (props: { record: PersonalRecord }) => (
	<A
		href={`/workouts/${props.record.workoutId}/${props.record.sessionId}`}
		class="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-base-300/30 transition-colors"
	>
		<div class="min-w-0">
			<div class="font-medium truncate">{props.record.exerciseName}</div>
			<div class="text-xs text-base-content/60 truncate">
				{props.record.workoutName} •{" "}
				{formatDate(props.record.date, {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				})}
			</div>
		</div>
		<div class="text-right ml-4">
			<div class="font-bold text-primary">{props.record.weight} kg</div>
			<div class="text-xs text-base-content/60">
				{props.record.reps} Wiederholungen
			</div>
		</div>
	</A>
);

const PersonalRecordsSection = (props: { records: PersonalRecord[] }) => (
	<Section title="Persönliche Rekorde" subtitle="Nach Gewicht">
		{props.records.length > 0 ? (
			<div class="space-y-2">
				<For each={props.records}>
					{(record) => <PersonalRecordItem record={record} />}
				</For>
			</div>
		) : (
			<div class="text-sm text-base-content/50">
				Noch keine Rekorde vorhanden.
			</div>
		)}
	</Section>
);

const WorkoutLink = (props: { workout: WorkoutEntry }) => (
	<A
		href={`/workouts/${props.workout.id}/${props.workout.sessionId}`}
		class="block"
	>
		<div class="flex items-center gap-3 p-3 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors group">
			<div class="w-2 h-2 bg-primary-content rounded-full flex-shrink-0"></div>
			<div class="font-medium text-sm flex-1 min-w-0">{props.workout.name}</div>
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
);

const WeekDayHeader = (props: { day: WeekDay; active: boolean }) => (
	<div
		class={`p-4 border-b ${
			props.active ? "border-primary/20 bg-primary/5" : "border-base-300"
		}`}
	>
		<div class="flex items-center justify-between">
			<div>
				<div
					class={`text-sm font-semibold ${
						props.active ? "text-primary" : "text-base-content/60"
					}`}
				>
					{props.day.dayName}
				</div>
				<div
					class={`text-2xl font-bold ${
						props.active ? "text-primary" : "text-base-content"
					}`}
				>
					{props.day.date.getDate()}
				</div>
			</div>
			<div class="text-right">
				<div class="text-xs text-base-content/50">
					{monthNames[props.day.date.getMonth()]}
				</div>
				{props.active && (
					<div class="badge badge-primary badge-sm mt-1">Heute</div>
				)}
			</div>
		</div>
	</div>
);

const WeekDayWorkouts = (props: { workouts: WorkoutEntry[] }) => (
	<div class="p-4">
		{props.workouts.length > 0 ? (
			<div class="space-y-2">
				<For each={props.workouts}>
					{(workout) => <WorkoutLink workout={workout} />}
				</For>
			</div>
		) : (
			<div class="text-center text-base-content/40 text-sm">Kein Training</div>
		)}
	</div>
);

const WeekDayCard = (props: {
	day: WeekDay;
	isToday: OverviewState["isToday"];
}) => {
	const active = () => props.isToday(props.day.date);
	return (
		<div
			class={`bg-base-100 rounded-xl border-2 transition-all ${
				active()
					? "border-primary shadow-lg shadow-primary/20"
					: "border-base-300 hover:border-base-400"
			}`}
		>
			<WeekDayHeader day={props.day} active={active()} />
			<WeekDayWorkouts workouts={props.day.workouts} />
		</div>
	);
};

const WeekDaysSection = (props: {
	weekDays: OverviewState["weekDays"];
	isToday: OverviewState["isToday"];
}) => (
	<Section title="Trainingsplan">
		<div class="space-y-3">
			<For each={props.weekDays()}>
				{(day) => <WeekDayCard day={day} isToday={props.isToday} />}
			</For>
		</div>
	</Section>
);

const WorkoutCalendar = () => {
	const state = createOverviewPageState();

	return (
		<>
			<Header title="Übersicht" />
			<div class="mx-auto flex flex-col gap-4">
				<WeekNavigationSection
					weekRange={state.weekRange}
					weeklyInsights={state.weeklyInsights}
					previousWeek={state.previousWeek}
					nextWeek={state.nextWeek}
					goToToday={state.goToToday}
				/>
				<PersonalRecordsSection records={state.personalRecords()} />
				<WeekDaysSection weekDays={state.weekDays} isToday={state.isToday} />
			</div>
		</>
	);
};

export default WorkoutCalendar;
