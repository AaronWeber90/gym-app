import { type Accessor, Index, Show } from "solid-js";
import { ExerciseBlock } from "../features/session/components/exercise-block";
import { ShareSessionDropdown } from "../features/session/components/share-session-dropdown";
import { createSessionPageState } from "../features/session/hooks/create-session-page-state";
import type { ExerciseData, SessionData } from "../features/session/utils";
import { Header } from "../features/workouts/components/header";
import { ConfirmDeleteButton } from "../ui/confirm-delete-button";
import { formatDate } from "../utils/format-date";

type SessionState = ReturnType<typeof createSessionPageState>;

const DropIndicator = (props: { name: string }) => (
	<div class="border-2 border-dashed border-primary rounded-box p-4 text-center text-sm text-primary">
		{props.name} hier einfügen
	</div>
);

const ExerciseListItem = (props: {
	ex: Accessor<ExerciseData>;
	exIndex: number;
	state: SessionState;
}) => {
	const state = props.state;
	const draggedName = () =>
		state.exercises()[state.sortable.dragIndex() ?? -1]?.name || "Übung";
	const showBefore = () =>
		state.sortable.dragIndex() !== null &&
		state.sortable.overIndex() === props.exIndex &&
		state.sortable.dragIndex() !== props.exIndex &&
		((state.sortable.dragIndex() ?? -1) > props.exIndex || props.exIndex === 0);
	const showAfter = () =>
		state.sortable.dragIndex() !== null &&
		state.sortable.overIndex() === props.exIndex &&
		state.sortable.dragIndex() !== props.exIndex &&
		(state.sortable.dragIndex() ?? -1) < props.exIndex;

	return (
		<>
			<Show when={showBefore()}>
				<DropIndicator name={draggedName()} />
			</Show>
			<ExerciseBlock
				exercise={props.ex()}
				canRemove={state.exercises().length > 1}
				previousSets={state
					.previousExerciseMap()
					.get(props.ex().name.toLowerCase().trim())}
				onNameChange={(name) => state.updateExerciseName(props.exIndex, name)}
				onUpdateSet={(setIndex, field, value) =>
					state.updateSet(props.exIndex, setIndex, field, value)
				}
				onAddSet={() => state.addSet(props.exIndex)}
				onRemoveSet={(setIndex) => state.removeSet(props.exIndex, setIndex)}
				onRemove={() => state.removeExercise(props.exIndex)}
				isDragging={state.sortable.dragIndex() === props.exIndex}
				isAnyDragging={state.sortable.dragIndex() !== null}
				onDragStart={(e) => state.sortable.startDrag(props.exIndex, e)}
				registerItem={(el) => state.sortable.registerItem(props.exIndex, el)}
				unregisterItem={() => state.sortable.unregisterItem(props.exIndex)}
			/>
			<Show when={showAfter()}>
				<DropIndicator name={draggedName()} />
			</Show>
		</>
	);
};

const ExerciseList = (props: { state: SessionState }) => (
	<div class="space-y-6">
		<Index each={props.state.exercises()}>
			{(ex, exIndex) => (
				<ExerciseListItem ex={ex} exIndex={exIndex} state={props.state} />
			)}
		</Index>
	</div>
);

const SessionView = (props: { session: SessionData; state: SessionState }) => (
	<div>
		<Header
			title={formatDate(props.session.date, {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			})}
			action={
				<div class="flex items-center gap-1">
					<ShareSessionDropdown
						session={props.session}
						exercises={props.state.exercises()}
					/>
					<ConfirmDeleteButton
						ariaLabel="Session löschen"
						dialogTitle="Session löschen?"
						dialogMessage="Diese Session wird dauerhaft gelöscht."
						confirmLabel="Löschen"
						onConfirm={props.state.handleDeleteSession}
					/>
				</div>
			}
		/>
		<p class="text-sm text-base-content/60 mb-6">
			Gestartet um{" "}
			{formatDate(props.session.date, { hour: "2-digit", minute: "2-digit" })}
		</p>
		<ExerciseList state={props.state} />
		<button
			class="btn btn-outline btn-sm w-full mt-4"
			onClick={props.state.addExercise}
			type="button"
		>
			+ Übung hinzufügen
		</button>
	</div>
);

const WorkoutSession = () => {
	const state = createSessionPageState();

	return (
		<Show
			when={!state.sessionQuery.error}
			fallback={
				<div class="text-center py-12 text-error">
					Session konnte nicht geladen werden
				</div>
			}
		>
			<Show when={state.session()} fallback={<div class="min-h-screen" />}>
				{(s) => <SessionView session={s()} state={state} />}
			</Show>
		</Show>
	);
};

export default WorkoutSession;
