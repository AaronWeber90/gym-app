import { createSignal, Index, Show } from "solid-js";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

type ExerciseInput = {
	name: string;
	weight: number;
	sets: number;
};

type CreateSessionModalProps = {
	parentId: string;
	onCreated?: () => void | Promise<void>;
};

const CreateSessionModal = (props: CreateSessionModalProps) => {
	const [showModal, setShowModal] = createSignal(false);
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

	const handleSave = async () => {
		const validExercises = exercises().filter((ex) => ex.name.trim());

		try {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: true,
			});

			const parentDir = await workoutsDir.getDirectoryHandle(props.parentId, {
				create: true,
			});
			const childId = crypto.randomUUID();
			const handle = await parentDir.getFileHandle(`${childId}.json`, {
				create: true,
			});
			const writable = await handle.createWritable();

			const data = {
				id: childId,
				parentId: props.parentId,
				name: "",
				date: new Date(workoutDate()).toISOString(),
				created_at: new Date(workoutDate()).toISOString(),
				exercises: validExercises,
			};

			await writable.write(JSON.stringify(data, null, 2));
			await writable.close();
			await props.onCreated?.();
		} catch (err) {
			console.error("Failed to save child workout:", err);
			alert("Fehler beim Speichern");
			return;
		}

		setShowModal(false);
		setWorkoutDate(new Date().toISOString());
		setExercises([{ name: "", weight: 0, sets: 1 }]);
	};

	const handleCancel = () => {
		setShowModal(false);
		setWorkoutDate(new Date().toISOString());
		setExercises([{ name: "", weight: 0, sets: 1 }]);
	};

	return (
		<>
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
			<div class="fab fab-overwrite pb-4">
				<button
					class="btn btn-lg btn-circle btn-primary"
					onClick={() => setShowModal(true)}
					type="button"
				>
					+
				</button>
			</div>
		</>
	);
};

export default CreateSessionModal;
