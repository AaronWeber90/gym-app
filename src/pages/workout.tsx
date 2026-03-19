import { A, useNavigate, useParams } from "@solidjs/router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import {
	createMemo,
	createSignal,
	For,
	Index,
	Match,
	Show,
	Switch,
} from "solid-js";
import {
	createWorkoutResource,
	workoutsQueryKey,
} from "../features/create-workout-resource";
import { getDir, getRootDir } from "../features/opfs-storage/utils";
import { Button } from "../ui/button";
import { TableCellsIcon } from "../ui/icons/table-cells";
import { Input } from "../ui/input";

type ExerciseInput = {
	name: string;
	weight: number;
	sets: number;
};

const Workout = () => {
	const { workouts } = createWorkoutResource();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const params = useParams();
	const [showModal, setShowModal] = createSignal(false);
	const [workoutName, setWorkoutName] = createSignal("");
	const [workoutDate, setWorkoutDate] = createSignal(new Date().toISOString());
	const [exercises, setExercises] = createSignal<ExerciseInput[]>([
		{ name: "", weight: 0, sets: 1 },
	]);

	const getDateValue = () => {
		try {
			return new Date(workoutDate()).toISOString().slice(0, 10);
		} catch {
			return new Date().toISOString().slice(0, 10);
		}
	};

	const getTimeValue = () => {
		try {
			return new Date(workoutDate()).toISOString().slice(11, 16);
		} catch {
			return new Date().toISOString().slice(11, 16);
		}
	};

	const handleDateChange = (newDate: string) => {
		const time = getTimeValue();
		const combined = new Date(`${newDate}T${time}`).toISOString();
		setWorkoutDate(combined);
	};

	const handleTimeChange = (newTime: string) => {
		const date = getDateValue();
		const combined = new Date(`${date}T${newTime}`).toISOString();
		setWorkoutDate(combined);
	};

	const fetchChildWorkouts = async () => {
		if (!params.id) return [];
		try {
			const root = await getRootDir();
			const workoutsDir = await getDir(root, "workouts", true);
			const parentDir = await workoutsDir.getDirectoryHandle(params.id, {
				create: false,
			});
			const result: {
				id: string;
				name: string;
				date: string;
				created_at: string;
			}[] = [];
			for await (const [name, handle] of parentDir.entries()) {
				if (handle.kind === "file" && name.endsWith(".json")) {
					try {
						// @ts-expect-error TS doesn't narrow FileSystemHandle to FileSystemFileHandle via kind check
						const file = await handle.getFile();
						const text = await file.text();
						const data = JSON.parse(text);
						result.push({
							id: data.id ?? name.replace(".json", ""),
							name: data.name ?? "Unbenannt",
							date: data.date,
							created_at: data.created_at,
						});
					} catch (err) {
						console.warn("Failed to read child workout:", err);
					}
				}
			}
			return result.toSorted(
				(a, b) =>
					new Date(b.created_at ?? 0).getTime() -
					new Date(a.created_at ?? 0).getTime(),
			);
		} catch (err) {
			console.error("Failed to load child workouts:", err);
			return [];
		}
	};

	const childWorkoutsQuery = createQuery(() => ({
		queryKey: ["childWorkouts", params.id],
		queryFn: fetchChildWorkouts,
		enabled: !!params.id,
		throwOnError: true,
	}));
	const childWorkouts = () => childWorkoutsQuery.data;
	const refetchChildWorkouts = () =>
		queryClient.invalidateQueries({
			queryKey: ["childWorkouts", params.id],
		});

	const addExercise = () => {
		setExercises([...exercises(), { name: "", weight: 0, sets: 1 }]);
	};

	const removeExercise = (index: number) => {
		setExercises(exercises().filter((_, i) => i !== index));
	};

	const updateExercise = (
		index: number,
		field: keyof ExerciseInput,
		value: string | number,
	) => {
		setExercises(
			exercises().map((ex, i) =>
				i === index ? { ...ex, [field]: value } : ex,
			),
		);
	};

	const handleSaveWorkout = async () => {
		if (!params.id) {
			alert("Kein Parent-Workout gefunden");
			return;
		}

		const validExercises = exercises().filter((ex) => ex.name.trim());

		try {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: true,
			});

			const parentDir = await workoutsDir.getDirectoryHandle(params.id, {
				create: true,
			});
			const childId = crypto.randomUUID();
			const handle = await parentDir.getFileHandle(`${childId}.json`, {
				create: true,
			});
			const writable = await handle.createWritable();

			const data = {
				id: childId,
				parentId: params.id,
				name: workoutName().trim(),
				date: new Date(workoutDate()).toISOString(),
				created_at: new Date(workoutDate()).toISOString(),
				exercises: validExercises,
			};

			await writable.write(JSON.stringify(data, null, 2));
			await writable.close();
			await refetchChildWorkouts();
			await queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
		} catch (err) {
			console.error("Failed to save child workout:", err);
			alert("Fehler beim Speichern");
			return;
		}

		// Reset modal state
		setShowModal(false);
		setWorkoutName("");
		setWorkoutDate(new Date().toISOString());
		setExercises([{ name: "", weight: 0, sets: 1 }]);
	};

	const handleCancelModal = () => {
		setShowModal(false);
		setWorkoutName("");
		setWorkoutDate(new Date().toISOString());
		setExercises([{ name: "", weight: 0, sets: 1 }]);
	};

	const currentWorkout = createMemo(() => {
		const data = workouts();
		if (!data) return undefined;
		return data.find((workout) => workout.id === params.id);
	});

	const deleteWorkout = async () => {
		try {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: false,
			});

			// Delete the directory containing child workouts (if it exists)
			try {
				await workoutsDir.removeEntry(params.id, { recursive: true });
			} catch (err) {
				// Directory might not exist if no child workouts were created
				console.warn(
					"Child workouts directory not found or already deleted:",
					err,
				);
			}

			// Delete the parent workout JSON file
			await workoutsDir.removeEntry(`${params.id}.json`);

			// Redirect or update UI after deletion as needed
			navigate("/workouts");
		} catch (err) {
			console.error("Failed to delete workout:", err);
		}
	};

	return (
		<>
			<Show when={workouts()}>
				<div class="overflow-x-auto w-full max-w-full">
					<div class="flex flex-row justify-between items-center">
						<h1 class="text-3xl font-bold">{currentWorkout()?.name}</h1>
						<Button onClick={deleteWorkout} variant="ghost">
							Löschen
						</Button>
					</div>

					<div class="mt-4">
						<Show when={childWorkouts()}>
							<Switch>
								<Match when={(childWorkouts()?.length ?? 0) > 0}>
									<ul class="list bg-base-100 rounded-box shadow-sm divide-y divide-base-300">
										<For each={childWorkouts()}>
											{(item) => (
												<A href={`/workouts/${params.id}/${item.id}`}>
													<li class="p-3 flex items-center justify-between">
														<div class="flex items-center gap-3">
															<TableCellsIcon />
															<div>
																<div class="font-medium">
																	{new Intl.DateTimeFormat("de-DE", {
																		day: "2-digit",
																		month: "2-digit",
																		year: "2-digit",
																	}).format(new Date(item.date)) ?? ""}
																</div>
																<div class="text-xs font-semibold opacity-60">
																	started at{" "}
																	{new Intl.DateTimeFormat("de-DE", {
																		hour: "2-digit",
																		minute: "2-digit",
																	}).format(new Date(item.date)) ?? ""}
																</div>
															</div>
														</div>
													</li>
												</A>
											)}
										</For>
									</ul>
								</Match>
							</Switch>
						</Show>
					</div>
					<div>
						<div class="fab fab-overwrite pb-4">
							<button
								class="btn btn-lg btn-circle btn-primary"
								onClick={() => setShowModal(true)}
								type="button"
							>
								+
							</button>
						</div>

						<Switch>
							<Match when={(childWorkouts()?.length ?? 0) < 1}>
								<div class="text-center text-base-content/50 py-8">
									Keine Übungen vorhanden
								</div>
							</Match>
						</Switch>
					</div>
				</div>
			</Show>

			<Show when={showModal()}>
				<dialog class="modal modal-open">
					<div class="modal-box max-w-2xl">
						<h3 class="font-bold text-lg mb-4">Neue Trainingseinheit</h3>
						<div class="flex flex-col gap-4">
							<Input
								type="date"
								label="Datum"
								value={getDateValue()}
								onInput={(e) => handleDateChange(e.currentTarget.value)}
							/>
							<Input
								type="time"
								label="Uhrzeit"
								value={getTimeValue()}
								onInput={(e) => handleTimeChange(e.currentTarget.value)}
							/>
						</div>
						<div class="divider">Übungen</div>

						<div class="space-y-4">
							<Index each={exercises()}>
								{(ex, index) => (
									<div class="card bg-base-200 p-4">
										<div class="flex justify-between items-start mb-2">
											<span class="font-semibold">Übung {index + 1}</span>
											<Show when={exercises().length > 1}>
												<button
													class="btn btn-ghost btn-xs btn-circle"
													onClick={() => removeExercise(index)}
													type="button"
												>
													✕
												</button>
											</Show>
										</div>
										<Input
											type="text"
											label="Name"
											value={ex().name}
											onInput={(e) =>
												updateExercise(index, "name", e.currentTarget.value)
											}
										/>
										<div class="grid grid-cols-2 gap-3 mt-2">
											<Input
												type="number"
												label="Gewicht (kg)"
												value={ex().weight}
												min={0}
												step={2.5}
												onInput={(e) =>
													updateExercise(
														index,
														"weight",
														Number.parseFloat(e.currentTarget.value) || 0,
													)
												}
											/>
											<Input
												type="number"
												label="Sätze"
												value={ex().sets}
												min={1}
												onInput={(e) =>
													updateExercise(
														index,
														"sets",
														Number.parseInt(e.currentTarget.value) || 1,
													)
												}
											/>
										</div>
									</div>
								)}
							</Index>
						</div>

						<Button
							variant="ghost"
							class="btn btn-outline btn-sm w-full mt-4"
							onClick={addExercise}
						>
							+ Übung hinzufügen
						</Button>

						<div class="modal-action">
							<Button variant="ghost" onClick={handleCancelModal}>
								Abbrechen
							</Button>
							<Button
								variant="primary"
								onClick={handleSaveWorkout}
								type="submit"
							>
								Speichern
							</Button>
						</div>
					</div>
				</dialog>
			</Show>
		</>
	);
};

export default Workout;
