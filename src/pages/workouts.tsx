import { A } from "@solidjs/router";
import { For, Match, Switch } from "solid-js";
import { createWorkoutResource } from "../features/create-workout-resource";
import { CreateWorkoutModal } from "../features/workout/create-workout-modal";
import { Header } from "../features/workouts/header";
import { FolderIcon } from "../ui/icons/folder";

export const Workouts = () => {
	const { workouts, refetch } = createWorkoutResource();

	const handleCreated = async () => {
		await refetch();
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
											<FolderIcon />
											<div>
												<div class="font-medium">{item.name}</div>
												<div class="text-xs uppercase font-semibold opacity-60">
													{new Intl.DateTimeFormat("de-DE").format(
														new Date(item.created_at),
													)}
												</div>
											</div>
										</div>
										<button class="btn btn-square btn-ghost" type="button">
											<svg
												class="size-[1.2em]"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
											>
												<title>right-arrow-icon</title>
												<g
													stroke-linejoin="round"
													stroke-linecap="round"
													stroke-width="2"
													fill="none"
													stroke="currentColor"
												>
													<path d="M6 3L20 12 6 21 6 3z"></path>
												</g>
											</svg>
										</button>
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
