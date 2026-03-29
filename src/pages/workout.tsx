import { useNavigate, useParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { For, lazy, Show } from "solid-js";
import { workoutsQueryKey } from "../features/create-workout-resource";
import { createChildWorkoutsResource } from "../features/workout/create-child-workouts-resource";
import { createCurrentWorkout } from "../features/workout/create-current-workout";
import { deleteWorkout } from "../features/workout/delete-workout";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { TableCellsIcon } from "../ui/icons/table-cells";
import { ListGroup } from "../ui/list-group";
import { ListItem } from "../ui/list-item";
import { formatDate } from "../utils/format-date";

const CreateSessionModal = lazy(
	() => import("../features/workout/create-session-modal"),
);

const Workout = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const params = useParams();
	const currentWorkout = createCurrentWorkout(() => params.id);
	const { childWorkouts, refetch: refetchChildWorkouts } =
		createChildWorkoutsResource(() => params.id);

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
			<CreateSessionModal
				parentId={params.id}
				onCreated={async () => {
					await refetchChildWorkouts();
					await queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
				}}
			/>
		</div>
	);
};

export default Workout;
