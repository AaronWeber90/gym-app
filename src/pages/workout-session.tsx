import { useParams } from "@solidjs/router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, lazy, Show } from "solid-js";
import { getDir, getRootDir } from "../features/opfs-storage/utils";
import { childWorkoutsQueryKey } from "../features/workout/create-child-workouts-resource";
import { formatDate } from "../utils/format-date";

const SessionModal = lazy(
	() => import("../features/workout/create-session-modal"),
);

type ExerciseData = {
	name: string;
	weight: number;
	sets: number;
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
							<div class="space-y-3">
								<For each={s().exercises}>
									{(exercise) => (
										<div class="card bg-base-100 shadow-sm">
											<div class="card-body p-4">
												<h3 class="font-bold text-lg">{exercise.name}</h3>
												<div class="flex gap-4 text-sm text-base-content/70">
													<span>{exercise.weight} kg</span>
													<span>
														{exercise.sets}{" "}
														{exercise.sets === 1 ? "Satz" : "Sätze"}
													</span>
												</div>
											</div>
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
