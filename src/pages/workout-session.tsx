import { Show, Index } from "solid-js";
import { ExerciseBlock } from "../features/session/components/exercise-block";
import { createSessionPageState } from "../features/session/create-session-page-state";
import { Header } from "../features/workouts/components/header";
import { ConfirmDeleteButton } from "../ui/confirm-delete-button";
import { formatDate } from "../utils/format-date";

const WorkoutSession = () => {
	const {
		exercises,
		session,
		sessionQuery,
		previousExerciseMap,
		updateExerciseName,
		updateSet,
		addSet,
		removeSet,
		addExercise,
		removeExercise,
		sortable,
		handleDeleteSession,
	} = createSessionPageState();

	return (
		<Show
			when={!sessionQuery.error}
			fallback={
				<div class="text-center py-12 text-error">
					Session konnte nicht geladen werden
				</div>
			}
		>
			<Show when={session()} fallback={<div class="min-h-screen" />}>
				{(s) => (
					<div>
						<Header
							title={formatDate(s().date, {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							})}
							action={
								<ConfirmDeleteButton
									ariaLabel="Session löschen"
									dialogTitle="Session löschen?"
									dialogMessage="Diese Session wird dauerhaft gelöscht."
									confirmLabel="Löschen"
									onConfirm={handleDeleteSession}
								/>
							}
						/>
						<p class="text-sm text-base-content/60 mb-6">
							Gestartet um{" "}
							{formatDate(s().date, { hour: "2-digit", minute: "2-digit" })}
						</p>

						<div class="space-y-6">
							<Index each={exercises()}>
								{(ex, exIndex) => (
									<>
										<Show
											when={
												sortable.dragIndex() !== null &&
												sortable.overIndex() === exIndex &&
												sortable.dragIndex() !== exIndex &&
												((sortable.dragIndex() ?? -1) > exIndex ||
													exIndex === 0)
											}
										>
											<div class="border-2 border-dashed border-primary rounded-box p-4 text-center text-sm text-primary">
												{exercises()[sortable.dragIndex() ?? -1]?.name ||
													"Übung"}{" "}
												hier einfügen
											</div>
										</Show>
										<ExerciseBlock
											exercise={ex()}
											canRemove={exercises().length > 1}
											previousSets={previousExerciseMap().get(
												ex().name.toLowerCase().trim(),
											)}
											onNameChange={(name) => updateExerciseName(exIndex, name)}
											onUpdateSet={(setIndex, field, value) =>
												updateSet(exIndex, setIndex, field, value)
											}
											onAddSet={() => addSet(exIndex)}
											onRemoveSet={(setIndex) => removeSet(exIndex, setIndex)}
											onRemove={() => removeExercise(exIndex)}
											isDragging={sortable.dragIndex() === exIndex}
											isAnyDragging={sortable.dragIndex() !== null}
											onDragStart={(e) => sortable.startDrag(exIndex, e)}
											registerItem={(el) => sortable.registerItem(exIndex, el)}
											unregisterItem={() => sortable.unregisterItem(exIndex)}
										/>
										<Show
											when={
												sortable.dragIndex() !== null &&
												sortable.overIndex() === exIndex &&
												sortable.dragIndex() !== exIndex &&
												(sortable.dragIndex() ?? -1) < exIndex
											}
										>
											<div class="border-2 border-dashed border-primary rounded-box p-4 text-center text-sm text-primary">
												{exercises()[sortable.dragIndex() ?? -1]?.name ||
													"Übung"}{" "}
												hier einfügen
											</div>
										</Show>
									</>
								)}
							</Index>
						</div>

						<button
							class="btn btn-outline btn-sm w-full mt-4"
							onClick={addExercise}
							type="button"
						>
							+ Übung hinzufügen
						</button>
					</div>
				)}
			</Show>
		</Show>
	);
};

export default WorkoutSession;
