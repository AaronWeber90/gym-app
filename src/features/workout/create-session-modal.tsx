import { createSignal, Index, Show } from "solid-js";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { writeFile } from "../opfs-storage/utils";

type SetInput = {
	weight: number;
	reps: number;
};

type ExerciseInput = {
	name: string;
	sets: SetInput[];
};

type SessionData = {
	id: string;
	parentId: string;
	name: string;
	date: string;
	created_at: string;
	exercises: ExerciseInput[];
};

type SessionModalProps = {
	parentId: string;
	session?: SessionData;
	previousExercises?: ExerciseInput[];
	onSaved?: () => void | Promise<void>;
};

const SessionModal = (props: SessionModalProps) => {
	const isEdit = () => !!props.session;

	const defaultExercise = (): ExerciseInput => ({
		name: "",
		sets: [{ weight: 0, reps: 1 }],
	});

	const [showModal, setShowModal] = createSignal(false);
	const [workoutDate, setWorkoutDate] = createSignal(new Date().toISOString());
	const [exercises, setExercises] = createSignal<ExerciseInput[]>([
		defaultExercise(),
	]);

	const normalizeExercises = (
		exercises: Record<string, unknown>[],
	): ExerciseInput[] =>
		exercises.map((ex) => {
			const name = typeof ex.name === "string" ? ex.name : "";
			// New format: sets is an array of { weight, reps }
			if (Array.isArray(ex.sets)) {
				return {
					name,
					sets: ex.sets.map((s: Record<string, unknown>) => ({
						weight: Number(s.weight) || 0,
						reps: Number(s.reps) || 1,
					})),
				};
			}
			// Old format: { name, weight, sets (number) }
			const count = Number(ex.sets) || 1;
			const weight = Number(ex.weight) || 0;
			return {
				name,
				sets: Array.from({ length: count }, () => ({ weight, reps: 1 })),
			};
		});

	const openModal = () => {
		if (props.session) {
			setWorkoutDate(props.session.date);
			const raw = props.session.exercises as Record<string, unknown>[];
			setExercises(
				raw.length > 0 ? normalizeExercises(raw) : [defaultExercise()],
			);
		} else {
			setWorkoutDate(new Date().toISOString());
			if (props.previousExercises?.length) {
				const normalized = normalizeExercises(
					props.previousExercises as unknown as Record<string, unknown>[],
				);
				setExercises(
					normalized.map((ex) => ({
						name: ex.name,
						sets: ex.sets.map((s) => ({ weight: 0, reps: s.reps })),
					})),
				);
			} else {
				setExercises([defaultExercise()]);
			}
		}
		setShowModal(true);
	};

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

	const addExercise = () => {
		setExercises([...exercises(), defaultExercise()]);
	};

	const removeExercise = (index: number) => {
		setExercises(exercises().filter((_, i) => i !== index));
	};

	const updateExerciseName = (index: number, name: string) => {
		setExercises(
			exercises().map((ex, i) => (i === index ? { ...ex, name } : ex)),
		);
	};

	const addSet = (exIndex: number) => {
		const lastSet = exercises()[exIndex].sets.at(-1);
		const newSet = lastSet
			? { weight: lastSet.weight, reps: lastSet.reps }
			: { weight: 0, reps: 1 };
		setExercises(
			exercises().map((ex, i) =>
				i === exIndex ? { ...ex, sets: [...ex.sets, newSet] } : ex,
			),
		);
	};

	const removeSet = (exIndex: number, setIndex: number) => {
		setExercises(
			exercises().map((ex, i) =>
				i === exIndex
					? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
					: ex,
			),
		);
	};

	const updateSet = (
		exIndex: number,
		setIndex: number,
		field: keyof SetInput,
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

	const handleSave = async () => {
		const validExercises = exercises().filter((ex) => ex.name.trim());

		try {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: true,
			});

			await workoutsDir.getDirectoryHandle(props.parentId, {
				create: true,
			});

			const childId = props.session?.id ?? crypto.randomUUID();

			const data = {
				id: childId,
				parentId: props.parentId,
				name: props.session?.name ?? "",
				date: new Date(workoutDate()).toISOString(),
				created_at:
					props.session?.created_at ?? new Date(workoutDate()).toISOString(),
				exercises: validExercises,
			};

			await writeFile(
				["workouts", props.parentId, `${childId}.json`],
				JSON.stringify(data, null, 2),
			);
			await props.onSaved?.();
		} catch (err) {
			console.error("Failed to save workout session:", err);
			alert("Fehler beim Speichern");
			return;
		}

		setShowModal(false);
	};

	const handleCancel = () => {
		setShowModal(false);
	};

	return (
		<>
			<Show when={showModal()}>
				<dialog class="modal modal-open z-[1000]">
					<div class="modal-box w-full sm:w-11/12 max-w-5xl">
						<h3 class="font-bold text-lg mb-4">
							{isEdit()
								? "Trainingseinheit bearbeiten"
								: "Neue Trainingseinheit"}
						</h3>
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
												updateExerciseName(index, e.currentTarget.value)
											}
										/>
										<div class="mt-3 space-y-2">
											<Index each={ex().sets}>
												{(set, setIndex) => {
													const prevSet = () =>
														props.previousExercises?.[index]?.sets?.[setIndex];
													return (
														<div class="flex items-end gap-2">
															<div class="flex-1">
																<Input
																	type="number"
																	label={
																		setIndex === 0 ? "Gewicht (kg)" : undefined
																	}
																	value={set().weight}
																	min={0}
																	step={2.5}
																	placeholder={
																		prevSet()?.weight === undefined
																			? undefined
																			: `${prevSet()?.weight}`
																	}
																	onInput={(e) =>
																		updateSet(
																			index,
																			setIndex,
																			"weight",
																			Number.parseFloat(
																				e.currentTarget.value,
																			) || 0,
																		)
																	}
																/>
																<Show
																	when={!isEdit() && prevSet()?.weight != null}
																>
																	<span class="text-xs text-base-content/50">
																		vorher: {prevSet()?.weight} kg
																	</span>
																</Show>
															</div>
															<div class="flex-1">
																<Input
																	type="number"
																	label={setIndex === 0 ? "Wdh." : undefined}
																	value={set().reps}
																	min={1}
																	onInput={(e) =>
																		updateSet(
																			index,
																			setIndex,
																			"reps",
																			Number.parseInt(e.currentTarget.value) ||
																				1,
																		)
																	}
																/>
																<Show
																	when={!isEdit() && prevSet()?.reps != null}
																>
																	<span class="text-xs text-base-content/50">
																		vorher: {prevSet()?.reps}
																	</span>
																</Show>
															</div>
															<Show when={ex().sets.length > 1}>
																<button
																	class="btn btn-ghost btn-xs btn-circle mb-1"
																	onClick={() => removeSet(index, setIndex)}
																	type="button"
																>
																	✕
																</button>
															</Show>
														</div>
													);
												}}
											</Index>
										</div>
										<button
											class="btn btn-ghost btn-xs mt-2"
											onClick={() => addSet(index)}
											type="button"
										>
											+ Satz
										</button>
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
							<Button variant="ghost" onClick={handleCancel}>
								Abbrechen
							</Button>
							<Button variant="primary" onClick={handleSave} type="submit">
								Speichern
							</Button>
						</div>
					</div>
				</dialog>
			</Show>
			<Show
				when={!isEdit()}
				fallback={
					<Button variant="ghost" onClick={openModal}>
						Bearbeiten
					</Button>
				}
			>
				<div class="fab fab-overwrite pb-4">
					<button
						class="btn btn-lg btn-circle btn-primary"
						onClick={openModal}
						type="button"
					>
						+
					</button>
				</div>
			</Show>
		</>
	);
};

export default SessionModal;
