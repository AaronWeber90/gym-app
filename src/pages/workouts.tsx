import { type Accessor, For, lazy, Show } from "solid-js";
import { Header } from "../features/workouts/components/header";
import { WorkoutSubtitle } from "../features/workouts/components/workout-subtitle";
import { createWorkoutsPageState } from "../features/workouts/hooks/create-workouts-page-state";
import type { WorkoutsSortMode } from "../features/workouts/utils/sort-workouts";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { FolderIcon } from "../ui/icons/folder";
import { FolderWithSheetsIcon } from "../ui/icons/folder-with-sheets";
import { SortIcon } from "../ui/icons/sort";
import { ListGroup } from "../ui/list-group";
import { ListItem } from "../ui/list-item";

const CreateWorkoutModal = lazy(
	() => import("../features/workout/components/create-workout-modal"),
);

const SortDropdown = (props: {
	sortOrder: Accessor<WorkoutsSortMode>;
	setSortOrder: (mode: WorkoutsSortMode) => void;
}) => {
	const sortDropdownId = "workout-sort-dropdown";
	const sortButtonAnchor = "--sort-button";

	return (
		<div style={`anchor-name:${sortButtonAnchor}`}>
			<Button
				variant="square-ghost"
				popovertarget={sortDropdownId}
				type="button"
				aria-label="Sortieren"
			>
				<SortIcon />
			</Button>
			<ul
				class="dropdown menu w-40 rounded-box bg-base-200 shadow-lg"
				popover
				id={sortDropdownId}
				style={`position-anchor:${sortButtonAnchor}`}
			>
				<li>
					<button
						type="button"
						onClick={() => props.setSortOrder("asc")}
						class={props.sortOrder() === "asc" ? "active" : ""}
					>
						<span class="mr-2 w-4 inline-block">
							{props.sortOrder() === "asc" && "✓"}
						</span>
						A-Z
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() => props.setSortOrder("desc")}
						class={props.sortOrder() === "desc" ? "active" : ""}
					>
						<span class="mr-2 w-4 inline-block">
							{props.sortOrder() === "desc" && "✓"}
						</span>
						Z-A
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() => props.setSortOrder("oldest")}
						class={props.sortOrder() === "oldest" ? "active" : ""}
					>
						<span class="mr-2 w-4 inline-block">
							{props.sortOrder() === "oldest" && "✓"}
						</span>
						Ältestes zuerst
					</button>
				</li>
			</ul>
		</div>
	);
};

const Workouts = () => {
	const { sortedWorkouts, sortOrder, setSortOrder, handleCreated } =
		createWorkoutsPageState();

	return (
		<>
			<Header
				title="Workouts"
				action={
					<SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
				}
			/>
			<Show
				when={(sortedWorkouts()?.length ?? 0) > 0}
				fallback={
					<>
						<EmptyState message="Keine Übungen vorhanden" />
						<CreateWorkoutModal onCreated={handleCreated} />
					</>
				}
			>
				<ListGroup>
					<For each={sortedWorkouts()}>
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
