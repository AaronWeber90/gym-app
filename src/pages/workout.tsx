import { useNavigate, useParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { createMemo, For, lazy, Show } from "solid-js";
import { createChildWorkoutsResource } from "../features/workout/create-child-workouts-resource";
import { createCurrentWorkout } from "../features/workout/create-current-workout";
import { workoutsQueryKey } from "../features/workout/create-workout-resource";
import { deleteWorkout } from "../features/workout/delete-workout";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { TableCellsIcon } from "../ui/icons/table-cells";
import { ListGroup } from "../ui/list-group";
import { ListItem } from "../ui/list-item";
import { formatDate } from "../utils/format-date";

const SessionModal = lazy(
	() => import("../features/workout/create-session-modal"),
);

const Workout = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const params = useParams();
	const currentWorkout = createCurrentWorkout(() => params.id);
	const { childWorkouts, refetch: refetchChildWorkouts } =
		createChildWorkoutsResource(() => params.id);

	const latestExercises = createMemo(() => {
		const sessions = childWorkouts();
		if (!sessions?.length) return undefined;
		const latestId = sessions[0].id;
		const cached = queryClient.getQueryData<{ exercises?: unknown[] }>([
			"workoutSession",
			params.id,
			latestId,
		]);
		if (!cached?.exercises?.length) return undefined;
		return cached.exercises as {
			name: string;
			sets: { weight: number; reps: number }[];
		}[];
	});

	const handleDelete = async () => {
		try {
			await deleteWorkout(params.id);
			navigate("/workouts");
		} catch (err) {
			console.error("Failed to delete workout:", err);
		}
	};

	return (
		<div class="overflow-x-auto w-full max-w-full">
			<div class="flex flex-row justify-between items-center">
				<h1 class="text-3xl font-bold">{currentWorkout()?.name}</h1>
				<Button onClick={handleDelete} variant="ghost">
					Löschen
				</Button>
			</div>
			<div class="mt-4">
				<Show when={(childWorkouts()?.length ?? 0) > 0}>
					<ListGroup>
						<For each={childWorkouts()}>
							{(item) => (
								<ListItem
									href={`/workouts/${params.id}/${item.id}`}
									icon={<TableCellsIcon />}
									title={formatDate(item.date, {
										day: "2-digit",
										month: "2-digit",
										year: "2-digit",
									})}
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
				parentId={params.id}
				previousExercises={latestExercises()}
				onSaved={async () => {
					await refetchChildWorkouts();
					await queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
				}}
			/>
		</div>
	);
};

export default Workout;
