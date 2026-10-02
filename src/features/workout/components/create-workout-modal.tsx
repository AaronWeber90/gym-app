import { dataClient } from "@api";
import { createSignal } from "solid-js";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";

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
		if (!name) {
			return;
		}

		try {
			await dataClient.createWorkout({ name });
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
						<Input
							type="text"
							placeholder="Workout name"
							class="input-bordered mb-4"
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
					aria-label="Training hinzufügen"
					type="button"
				>
					+
				</button>
			</div>
		</>
	);
};
