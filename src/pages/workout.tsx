import { useNavigate, useParams } from "@solidjs/router";
import {
	createMemo,
	createResource,
	createSignal,
	For,
	Match,
	Show,
	Switch,
} from "solid-js";
import { createWorkoutResource } from "../features/create-workout-resource";
import { Button } from "../ui/button";
import { TableCellsIcon } from "../ui/icons/table-cells";

export const Workout = () => {
	const { workouts } = createWorkoutResource();
	const navigate = useNavigate();
	const params = useParams();
	const [showModal, setShowModal] = createSignal(false);
	const [workoutName, setWorkoutName] = createSignal("");
	const [workoutDate, setWorkoutDate] = createSignal(
		new Date().toISOString().slice(0, 10),
	);
	const [newExercises, setNewExercises] = createSignal([
		{ name: "", sets: 1, reps: 10, weight: 0 },
	]);
	const [exercise, setExercise] = createSignal([]);

	const fetchChildWorkouts = async () => {
		if (!params.id) return [];
		try {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: false,
			});
			const parentDir = await workoutsDir.getDirectoryHandle(params.id, {
				create: false,
			});
			const items = [];
			for await (const [name, handle] of parentDir.entries()) {
				if (handle.kind === "file" && name.endsWith(".json")) {
					try {
						const file = await handle.getFile();
						const text = await file.text();
						const data = JSON.parse(text);
						items.push({
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
			return items.sort(
				(a, b) =>
					new Date(b.created_at ?? 0).getTime() -
					new Date(a.created_at ?? 0).getTime(),
			);
		} catch (err) {
			console.error("Failed to load child workouts:", err);
			return [];
		}
	};

	const [childWorkouts, { refetch: refetchChildWorkouts }] =
		createResource(fetchChildWorkouts);

	// const addExerciseInput = () => {
	// 	setNewExercises([
	// 		...newExercises(),
	// 		{ name: "", sets: 1, reps: 10, weight: 0 },
	// 	]);
	// };

	// const removeExerciseInput = (index) => {
	// 	setNewExercises(newExercises().filter((_, i) => i !== index));
	// };

	// const updateExerciseInput = (index, field, value) => {
	// 	const updated = [...newExercises()];
	// 	updated[index][field] = value;
	// 	setNewExercises(updated);
	// };

	const handleSaveWorkout = async () => {
		if (!params.id) {
			alert("Kein Parent-Workout gefunden");
			return;
		}
		// if (!workoutName().trim()) {
		// 	alert("Bitte gib einen Namen für das Training ein");
		// 	return;
		// }

		// const validExercises = newExercises().filter((ex) => ex.name.trim());
		// if (validExercises.length === 0) {
		// 	alert("Bitte füge mindestens eine Übung hinzu");
		// 	return;
		// }

		// Transform exercises to match the expected format
		// const formattedExercises = validExercises.map((ex) => ({
		// 	name: ex.name,
		// 	sets: Array.from({ length: ex.sets }, (_, i) => ({
		// 		set: i + 1,
		// 		reps: ex.reps,
		// 		weight: ex.weight,
		// 	})),
		// }));

		setExercise([...exercise()]);

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
				date: workoutDate(),
				created_at: new Date(`${workoutDate()}T00:00:00`).toISOString(),
			};

			await writable.write(JSON.stringify(data, null, 2));
			await writable.close();
			await refetchChildWorkouts();
		} catch (err) {
			console.error("Failed to save child workout:", err);
			alert("Fehler beim Speichern");
			return;
		}

		// Reset modal state
		setShowModal(false);
		setWorkoutName("");
		setWorkoutDate(new Date().toISOString().slice(0, 10));
		setNewExercises([{ name: "", sets: 1, reps: 10, weight: 0 }]);
	};

	const handleCancelModal = () => {
		setShowModal(false);
		setWorkoutName("");
		setWorkoutDate(new Date().toISOString().slice(0, 10));
		setNewExercises([{ name: "", sets: 1, reps: 10, weight: 0 }]);
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
						<h2 class="text-lg font-semibold mb-2">Einheiten</h2>
						<Show when={childWorkouts()}>
							<Switch>
								<Match when={childWorkouts()?.length < 1}>
									<div class="text-base-content/60">
										Noch keine Einheiten gespeichert.
									</div>
								</Match>
								<Match when={childWorkouts().length > 0}>
									<ul class="list bg-base-100 rounded-box shadow-sm divide-y divide-base-300">
										<For each={childWorkouts()}>
											{(item) => (
												<li class="p-3 flex items-center justify-between">
													<div class="flex items-center gap-3">
														<TableCellsIcon />
														<div class="font-medium">
															{new Intl.DateTimeFormat("de-DE", {
																day: "2-digit",
																month: "2-digit",
																year: "2-digit",
															}).format(new Date(item.date)) ?? ""}
														</div>
													</div>
												</li>
											)}
										</For>
									</ul>
								</Match>
							</Switch>
						</Show>
					</div>
					{/* Desktop Table */}

					{/* <table class="hidden md:table table-sm table-pin-rows w-full">
						<thead>
							<tr>
								<th>Übung</th>
								<th>Satz</th>
								<th>Wdh</th>
								<th>Gewicht (kg)</th>
							</tr>
						</thead>
						<tbody>
							{exercise().map((ex) =>
								ex.sets.map((s) => (
									<tr>
										<td>{ex.name}</td>
										<td>{s.set}</td>
										<td>{s.reps}</td>
										<td>{s.weight}</td>
									</tr>
								)),
							)}
						</tbody>
					</table> */}

					{/* Mobile Cards */}
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
							<Match when={childWorkouts()?.length < 1}>
								<div class="text-center text-base-content/50 py-8">
									Keine Übungen vorhanden
								</div>
							</Match>
						</Switch>
						{exercise().map((ex) => (
							<div class="card bg-base-200 shadow-sm">
								<div class="card-body p-4">
									<h3 class="font-bold text-lg mb-2">{ex.name}</h3>
									<div class="overflow-x-auto">
										<table class="table table-xs">
											<thead>
												<tr>
													<th>Satz</th>
													<th>Gewicht</th>
													<th>Whd.</th>
												</tr>
											</thead>
											<tbody>
												{ex.sets.map((s) => (
													<tr>
														<td>{s.set}</td>
														<td>
															<input
																type="number"
																min="0"
																placeholder="Type here"
																class="input input-ghost input-xs w-20"
																value={s.weight}
															/>
														</td>
														<td>
															<input
																type="number"
																min="0"
																placeholder="Type here"
																class="input input-ghost input-xs w-20"
																value={s.reps}
															/>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</Show>

			<Show when={showModal()}>
				<dialog class="modal modal-open">
					<div class="modal-box max-w-2xl">
						<h3 class="font-bold text-lg mb-4">Neue Trainingseinheit</h3>
						{/* 
						<input
							type="text"
							placeholder="Name der Trainingseinheit"
							class="input input-bordered w-full mb-4"
							value={workoutName()}
							onInput={(e) => setWorkoutName(e.target.value)}
						/> */}

						<div class="mb-4">
							<label class="label" for="workout-date">
								<span class="label-text">Datum</span>
							</label>
							<input
								type="date"
								id="workout-date"
								class="input input-bordered w-full"
								value={workoutDate()}
								onInput={(e) => setWorkoutDate(e.target.value)}
							/>
						</div>

						{/* TODO: Übungs-UI vorerst deaktiviert */}
						{/*
						<div class="divider">Übungen</div>

						<div class="space-y-4 max-h-96 overflow-y-auto">
							<For each={newExercises()}>
								{(ex, index) => (
									<div class="card bg-base-200 p-4">
										<div class="flex justify-between items-start mb-2">
											<span class="font-semibold">Übung {index() + 1}</span>
											<Show when={newExercises().length > 1}>
												<button
													class="btn btn-ghost btn-xs btn-circle"
													onClick={() => removeExerciseInput(index())}
												>
													✕
												</button>
											</Show>
										</div>

										<input
											type="text"
											placeholder="Übungsname"
											class="input input-bordered input-sm w-full mb-2"
											value={ex.name}
											onInput={(e) =>
												updateExerciseInput(index(), "name", e.target.value)
											}
										/>

										<div class="grid grid-cols-3 gap-2">
											<div>
												<label class="label label-text text-xs">Sätze</label>
												<input
													type="number"
													min="1"
													class="input input-bordered input-sm w-full"
													value={ex.sets}
													onInput={(e) =>
														updateExerciseInput(
															index(),
															"sets",
															parseInt(e.target.value) || 1,
														)
													}
												/>
											</div>
											<div>
												<label class="label label-text text-xs">Wdh</label>
												<input
													type="number"
													min="1"
													class="input input-bordered input-sm w-full"
													value={ex.reps}
													onInput={(e) =>
														updateExerciseInput(
															index(),
															"reps",
															parseInt(e.target.value) || 1,
														)
													}
												/>
											</div>
											<div>
												<label class="label label-text text-xs">
													Gewicht (kg)
												</label>
												<input
													type="number"
													min="0"
													step="2.5"
													class="input input-bordered input-sm w-full"
													value={ex.weight}
													onInput={(e) =>
														updateExerciseInput(
															index(),
															"weight",
															parseFloat(e.target.value) || 0,
														)
													}
												/>
											</div>
										</div>
									</div>
								)}
							</For>
						</div>

						<button
							class="btn btn-outline btn-sm w-full mt-4"
							onClick={addExerciseInput}
						>
							+ Weitere Übung hinzufügen
						</button>
						*/}

						<div class="modal-action">
							<button
								class="btn btn-ghost"
								onClick={handleCancelModal}
								type="button"
							>
								Abbrechen
							</button>
							<button
								class="btn btn-primary"
								onClick={handleSaveWorkout}
								type="button"
							>
								Speichern
							</button>
						</div>
					</div>
				</dialog>
			</Show>
		</>
	);
};
