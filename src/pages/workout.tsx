import { For, lazy, Show } from "solid-js";
import { createWorkoutPageState } from "../features/workout/hooks/create-workout-page-state";
import { Header } from "../features/workouts/components/header";
import { Badge } from "../ui/badge";
import { ConfirmDeleteButton } from "../ui/confirm-delete-button";
import { EmptyState } from "../ui/empty-state";
import { TableCellsIcon } from "../ui/icons/table-cells";
import { ListGroup } from "../ui/list-group";
import { ListItem } from "../ui/list-item";
import { formatDate } from "../utils/format-date";

const SessionModal = lazy(
	() => import("../features/workout/components/create-session-modal"),
);

const Workout = () => {
	const {
		currentWorkout,
		childWorkouts,
		latestExercises,
		handleDelete,
		handleSessionSaved,
		workoutId,
	} = createWorkoutPageState();

	return (
		<div class="overflow-x-auto w-full max-w-full">
			<Header
				title={currentWorkout()?.name || ""}
				action={
					<ConfirmDeleteButton
						ariaLabel="Trainingsplan löschen"
						dialogTitle="Trainingsplan löschen?"
						dialogMessage="Der Trainingsplan und alle Sessions werden dauerhaft gelöscht."
						confirmLabel="Löschen"
						onConfirm={handleDelete}
					/>
				}
			/>
			<div class="mt-4">
				<Show when={(childWorkouts()?.length ?? 0) > 0}>
					<ListGroup>
						<For each={childWorkouts()}>
							{(item) => (
								<ListItem
									href={`/workouts/${workoutId()}/${item.id}`}
									icon={<TableCellsIcon />}
									title={
										<span class="flex items-center gap-2">
											{formatDate(item.date, {
												day: "2-digit",
												month: "2-digit",
												year: "2-digit",
											})}
											<Show
												when={
													new Date(item.date).toDateString() ===
													new Date().toDateString()
												}
											>
												<Badge variant="neutral" size="sm">
													Heute
												</Badge>
											</Show>
										</span>
									}
									subtitle={`started at ${formatDate(item.date, {
										hour: "2-digit",
										minute: "2-digit",
									})}`}
								/>
							)}
						</For>
					</ListGroup>
				</Show>
			</div>
			<div>
				<Show when={(childWorkouts()?.length ?? 0) < 1}>
					<EmptyState message="Keine Übungen vorhanden" />
				</Show>
			</div>
			<SessionModal
				parentId={workoutId()}
				previousExercises={latestExercises()}
				onSaved={handleSessionSaved}
			/>
		</div>
	);
};

export default Workout;
