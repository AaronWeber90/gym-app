import { createMemo, createSignal, For, lazy, Show } from "solid-js";
import { createWorkoutResource } from "../features/workout/hooks/create-workout-resource";
import { Header } from "../features/workouts/components/header";
import { WorkoutSubtitle } from "../features/workouts/components/workout-subtitle";
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

const Workouts = () => {
	const { workouts, refetch } = createWorkoutResource();
	const [sortOrder, setSortOrder] = createSignal<"asc" | "desc">("asc");
	const sortDropdownId = "workout-sort-dropdown";
	const sortButtonAnchor = "--sort-button";

	const sortedWorkouts = createMemo(() => {
		const items = workouts();
		if (!items || items.length === 0) return items;
		return items
			.slice()
			.sort((a, b) =>
				sortOrder() === "asc"
					? a.name.localeCompare(b.name)
					: b.name.localeCompare(a.name),
			);
	});

	const handleCreated = () => {
		refetch();
	};

	return (
		<>
			<Header
				title="Workouts"
				action={
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
									onClick={() => setSortOrder("asc")}
									class={sortOrder() === "asc" ? "active" : ""}
								>
									<span class="mr-2 w-4 inline-block">
										{sortOrder() === "asc" && "✓"}
									</span>
									A-Z
								</button>
							</li>
							<li>
								<button
									type="button"
									onClick={() => setSortOrder("desc")}
									class={sortOrder() === "desc" ? "active" : ""}
								>
									<span class="mr-2 w-4 inline-block">
										{sortOrder() === "desc" && "✓"}
									</span>
									Z-A
								</button>
							</li>
						</ul>
					</div>
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
