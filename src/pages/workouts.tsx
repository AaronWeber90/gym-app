import { A } from "@solidjs/router";
import { For, Match, Switch } from "solid-js";
import { createWorkoutResource } from "../features/create-workout-resource";
import { CreateWorkoutModal } from "../features/workout/create-workout-modal";
import { Header } from "../features/workouts/header";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "../ui/icons/arrow-right";
import { FolderIcon } from "../ui/icons/folder";
import { FolderWithSheetsIcon } from "../ui/icons/folder-with-sheets";

export const Workouts = () => {
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
					<CreateWorkoutModal onCreated={handleCreated} />
				</Match>
				<Match when={workouts()}>
					<ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
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
										<Button variant="ghost">
											<ArrowRightIcon />
										</Button>
									</li>
								</A>
							)}
						</For>
					</ul>
					<CreateWorkoutModal onCreated={handleCreated} />
				</Match>
			</Switch>
		</>
	);
};
