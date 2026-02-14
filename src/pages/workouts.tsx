import { A } from "@solidjs/router";
import { For, lazy, Match, Switch } from "solid-js";
import { createWorkoutResource } from "../features/create-workout-resource";
import { Header } from "../features/workouts/header";
import { WorkoutList } from "../features/workouts/workout-list";
import { FolderIcon } from "../ui/icons/folder";
import { FolderWithSheetsIcon } from "../ui/icons/folder-with-sheets";

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
			<Header />
			<Switch>
				<Match when={workouts.error}>
					<span>Error: {workouts.error}</span>
				</Match>
				<Match when={workouts()?.length === 0}>
					<div class="text-center text-base-content/50 py-8">
						Keine Übungen vorhanden
					</div>
				</Match>
				<Match when={workouts()}>
					<WorkoutList>
						<For each={workouts()}>
							{(item) => (
								<A href={`/workouts/${item.id}`}>
									<li class="flex items-center justify-between p-3 hover:bg-base-200 transition">
										<div class="flex items-center gap-3">
											{item.lastTrainedAt ? (
												<FolderWithSheetsIcon class="h-8 w-8 text-primary" />
											) : (
												<FolderIcon class="h-8 w-8 text-primary" />
											)}
											<div>
												<div class="font-medium">{item.name}</div>
												<div class="text-xs font-semibold opacity-60">
													{item.lastTrainedAt
														? `last trained at ${new Intl.DateTimeFormat(
																"de-DE",
															).format(new Date(item.lastTrainedAt))}`
														: "not trained yet"}
												</div>
											</div>
										</div>
									</li>
								</A>
							)}
						</For>
					</WorkoutList>
					<CreateWorkoutModal onCreated={handleCreated} />
				</Match>
			</Switch>
		</>
	);
};

export default Workouts;
