import { createSignal } from "solid-js";
import { Button } from "../../ui/button";

type CreateWorkoutModalProps = {
	onCreated?: () => void | Promise<void>;
};

export const CreateWorkoutModal = (props: CreateWorkoutModalProps) => {
	const [showModal, setShowModal] = createSignal(false);
	const [newWorkoutName, setNewWorkoutName] = createSignal("");

	const cancelWorkoutCreation = () => {
		setNewWorkoutName("");
		setShowModal(false);
	};

	const handleAddWorkout = async () => {
		const name = newWorkoutName().trim();
		if (!name) return;

		try {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: true,
			});
			const id = crypto.randomUUID();
			const handle = await workoutsDir.getFileHandle(`${id}.json`, {
				create: true,
			});
			const writable = await handle.createWritable();

			const data = {
				id,
				name,
				created_at: new Date().toISOString(),
				exercises: [],
			};

			await writable.write(JSON.stringify(data, null, 2));
			await writable.close();

			setShowModal(false);
			setNewWorkoutName("");
			await props.onCreated?.();
		} catch (err) {
			console.error("Failed to add workout:", err);
		}
	};

	return (
		<>
			<dialog class="modal" open={showModal()}>
				<div class="modal-box">
					<h3 class="font-bold text-lg mb-2">Neuer Trainingsplan</h3>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleAddWorkout();
						}}
					>
						<input
							type="text"
							placeholder="Workout name"
							class="input input-bordered w-full mb-4"
							value={newWorkoutName()}
							onInput={(e) => setNewWorkoutName(e.currentTarget.value)}
						/>
						<div class="modal-action">
							<Button variant="ghost" onClick={cancelWorkoutCreation}>
								Abbrechen
							</Button>
							<Button type="submit" variant="primary">
								Speichern
							</Button>
						</div>
					</form>
				</div>
			</dialog>
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
