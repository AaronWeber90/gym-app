import { For, lazy, Show } from "solid-js";
import { createWorkoutResource } from "../features/workout/create-workout-resource";
import { Header } from "../features/workouts/components/header";
import { WorkoutSubtitle } from "../features/workouts/components/workout-subtitle";
import { EmptyState } from "../ui/empty-state";
import { FolderIcon } from "../ui/icons/folder";
import { FolderWithSheetsIcon } from "../ui/icons/folder-with-sheets";
import { ListGroup } from "../ui/list-group";
import { ListItem } from "../ui/list-item";

const CreateWorkoutModal = lazy(
	() => import("../features/workout/create-workout-modal"),
);

const Workouts = () => {
	const { workouts, refetch } = createWorkoutResource();

	const handleCreated = () => {
		refetch();
	};

	return (
		<>
			<Header title="Workouts" />
			<Show
				when={(workouts()?.length ?? 0) > 0}
				fallback={
					<>
						<EmptyState message="Keine Übungen vorhanden" />
						<CreateWorkoutModal onCreated={handleCreated} />
					</>
				}
			>
				<ListGroup>
					<For each={workouts()}>
						{(item) => (
							<ListItem
								href={`/workouts/${item.id}`}
								icon={
									item.lastTrainedAt ? (
										<FolderWithSheetsIcon class="h-8 w-8 text-primary" />
									) : (
										<FolderIcon class="h-8 w-8 text-primary" />
									)
								}
								title={item.name}
								subtitle={
									<WorkoutSubtitle lastTrainedAt={item.lastTrainedAt} />
								}
							/>
						)}
					</For>
				</ListGroup>
				<CreateWorkoutModal onCreated={handleCreated} />
			</Show>
		</>
	);
};

export default Workouts;
