import { useParams } from "@solidjs/router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { createEffect, createSignal, Index, Show } from "solid-js";
import { getDir, getRootDir } from "../features/opfs-storage/utils";
import { childWorkoutsQueryKey } from "../features/workout/create-child-workouts-resource";
import { formatDate } from "../utils/format-date";

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

	const [exercises, setExercises] = createSignal<ExerciseData[]>([]);

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

	createEffect(() => {
		const s = session();
		if (s?.exercises) {
			setExercises(
				s.exercises.map((ex) => ({
					name: ex.name,
					sets: ex.sets.map((set) => ({ weight: set.weight, reps: set.reps })),
				})),
			);
		}
	});

	const saveSession = async () => {
		const s = session();
		if (!s) return;

		try {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: true,
			});
			const parentDir = await workoutsDir.getDirectoryHandle(params.id, {
				create: true,
			});
			const handle = await parentDir.getFileHandle(
				`${params.sessionId}.json`,
				{ create: true },
			);
			const writable = await handle.createWritable();

			const data = {
				...s,
				exercises: exercises().filter((ex) => ex.name.trim()),
			};

			await writable.write(JSON.stringify(data, null, 2));
			await writable.close();

			queryClient.invalidateQueries({
				queryKey: ["workoutSession", params.id, params.sessionId],
			});
			queryClient.invalidateQueries({
				queryKey: childWorkoutsQueryKey(params.id),
			});
		} catch (err) {
			console.error("Failed to save workout session:", err);
		}
	};

	const updateExerciseName = (index: number, name: string) => {
		setExercises(
			exercises().map((ex, i) => (i === index ? { ...ex, name } : ex)),
		);
	};

	const updateSet = (
		exIndex: number,
		setIndex: number,
		field: keyof SetData,
		value: number,
	) => {
		setExercises(
			exercises().map((ex, i) =>
				i === exIndex
					? {
							...ex,
							sets: ex.sets.map((s, si) =>
								si === setIndex ? { ...s, [field]: value } : s,
							),
						}
					: ex,
			),
		);
	};

	const addSet = (exIndex: number) => {
		const lastSet = exercises()[exIndex]?.sets.at(-1);
		const newSet = lastSet
			? { weight: lastSet.weight, reps: lastSet.reps }
			: { weight: 0, reps: 1 };
		setExercises(
			exercises().map((ex, i) =>
				i === exIndex ? { ...ex, sets: [...ex.sets, newSet] } : ex,
			),
		);
		saveSession();
	};

	const removeSet = (exIndex: number, setIndex: number) => {
		setExercises(
			exercises().map((ex, i) =>
				i === exIndex
					? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
					: ex,
			),
		);
		saveSession();
	};

	const addExercise = () => {
		setExercises([
			...exercises(),
			{ name: "", sets: [{ weight: 0, reps: 1 }] },
		]);
	};

	const removeExercise = (index: number) => {
		setExercises(exercises().filter((_, i) => i !== index));
		saveSession();
	};

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

						<div class="space-y-6">
							<Index each={exercises()}>
								{(ex, exIndex) => (
									<div>
										<div class="flex items-center gap-2 mb-2">
											<input
												type="text"
												class="input input-ghost text-lg font-bold p-0"
												value={ex().name}
												placeholder="Übungsname"
												onInput={(e) =>
													updateExerciseName(exIndex, e.currentTarget.value)
												}
												onBlur={saveSession}
											/>
											<Show when={exercises().length > 1}>
												<button
													class="btn btn-ghost btn-xs btn-circle"
													onClick={() => removeExercise(exIndex)}
													type="button"
												>
													✕
												</button>
											</Show>
										</div>
										<table class="table">
											<thead>
												<tr>
													<th>Satz</th>
													<th>Gewicht (kg)</th>
													<th>Wdh.</th>
													<th />
												</tr>
											</thead>
											<tbody>
												<Index each={ex().sets}>
													{(set, setIndex) => (
														<tr>
															<td>{setIndex + 1}</td>
															<td>
																<input
																	type="number"
																	class="input input-ghost w-full p-0"
																	value={set().weight}
																	min={0}
																	step={2.5}
																	onInput={(e) =>
																		updateSet(
																			exIndex,
																			setIndex,
																			"weight",
																			Number.parseFloat(
																				e.currentTarget.value,
																			) || 0,
																		)
																	}
																	onBlur={saveSession}
																/>
															</td>
															<td>
																<input
																	type="number"
																	class="input input-ghost w-full p-0"
																	value={set().reps}
																	min={1}
																	onInput={(e) =>
																		updateSet(
																			exIndex,
																			setIndex,
																			"reps",
																			Number.parseInt(
																				e.currentTarget.value,
																			) || 1,
																		)
																	}
																	onBlur={saveSession}
																/>
															</td>
															<td>
																<Show when={ex().sets.length > 1}>
																	<button
																		class="btn btn-ghost btn-xs btn-circle"
																		onClick={() =>
																			removeSet(exIndex, setIndex)
																		}
																		type="button"
																	>
																		✕
																	</button>
																</Show>
															</td>
														</tr>
													)}
												</Index>
											</tbody>
										</table>
										<button
											class="btn btn-ghost btn-xs mt-1"
											onClick={() => addSet(exIndex)}
											type="button"
										>
											+ Satz
										</button>
									</div>
								)}
							</Index>
						</div>

						<button
							class="btn btn-outline btn-sm w-full mt-4"
							onClick={addExercise}
							type="button"
						>
							+ Übung hinzufügen
						</button>
					</div>
				)}
			</Show>
		</Show>
	);
};

export default WorkoutSession;
