import { useParams } from "@solidjs/router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, lazy, Show } from "solid-js";
import { getDir, getRootDir } from "../features/opfs-storage/utils";
import { childWorkoutsQueryKey } from "../features/workout/create-child-workouts-resource";
import { formatDate } from "../utils/format-date";

const SessionModal = lazy(
	() => import("../features/workout/create-session-modal"),
);

type SetData = {
	weight: number;
	reps: number;
};

type ExerciseData = {
	name: string;
	sets: SetData[];
};

type SessionData = {
	id: string;
	parentId: string;
	name: string;
	date: string;
	created_at: string;
	exercises: ExerciseData[];
};

const WorkoutSession = () => {
	const params = useParams();
	const queryClient = useQueryClient();

	const sessionQuery = createQuery(() => ({
		queryKey: ["workoutSession", params.id, params.sessionId],
		queryFn: async (): Promise<SessionData | null> => {
			const root = await getRootDir();
			const workoutsDir = await getDir(root, "workouts", true);
			const parentDir = await workoutsDir.getDirectoryHandle(params.id, {
				create: false,
			});
			const fileHandle = await parentDir.getFileHandle(
				`${params.sessionId}.json`,
			);
			const file = await fileHandle.getFile();
			const text = await file.text();
			return JSON.parse(text);
		},
		enabled: !!params.id && !!params.sessionId,
	}));

	const session = () => sessionQuery.data;

	const refetch = () =>
		queryClient.invalidateQueries({
			queryKey: ["workoutSession", params.id, params.sessionId],
		});

	const refetchParent = () =>
		queryClient.invalidateQueries({
			queryKey: childWorkoutsQueryKey(params.id),
		});

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
						<h1 class="text-2xl font-bold mb-1">
							{formatDate(s().date, {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							})}
						</h1>
						<p class="text-sm text-base-content/60 mb-6">
							Gestartet um{" "}
							{formatDate(s().date, { hour: "2-digit", minute: "2-digit" })}
						</p>

						<Show
							when={s().exercises?.length > 0}
							fallback={
								<div class="text-center text-base-content/50 py-8">
									Keine Übungen eingetragen
								</div>
							}
						>
							<div class="space-y-6">
								<For each={s().exercises}>
									{(exercise) => (
										<div>
											<h3 class="font-bold text-lg mb-2">{exercise.name}</h3>
											<table class="table">
												<thead>
													<tr>
														<th>Satz</th>
														<th>Gewicht (kg)</th>
														<th>Wdh.</th>
													</tr>
												</thead>
												<tbody>
													<For each={exercise.sets}>
														{(set, i) => (
															<tr>
																<td>{i() + 1}</td>
																<td>{set.weight}</td>
																<td>{set.reps}</td>
															</tr>
														)}
													</For>
												</tbody>
											</table>
										</div>
									)}
								</For>
							</div>
						</Show>
						<SessionModal
							parentId={params.id}
							session={s()}
							onSaved={async () => {
								await refetch();
								await refetchParent();
							}}
						/>
					</div>
				)}
			</Show>
		</Show>
	);
};

export default WorkoutSession;
