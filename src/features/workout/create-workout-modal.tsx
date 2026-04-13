import { createSignal, Show } from "solid-js";
import { Button } from "../../ui/button";
import { getDir, getRootDir, writeFile } from "../opfs-storage/utils";

type CreateWorkoutModalProps = {
	onCreated?: () => void | Promise<void>;
};

const CreateWorkoutModal = (props: CreateWorkoutModalProps) => {
	const [showModal, setShowModal] = createSignal(false);
	const [newWorkoutName, setNewWorkoutName] = createSignal("");
	const [error, setError] = createSignal("");

	const cancelWorkoutCreation = () => {
		setNewWorkoutName("");
		setShowModal(false);
	};

	const handleAddWorkout = async () => {
		const name = newWorkoutName().trim();
		if (!name) return;
		setError("");

		try {
			const root = await getRootDir();
			await getDir(root, "workouts", true);
			const id = crypto.randomUUID();

			const data = {
				id,
				name,
				created_at: new Date().toISOString(),
				exercises: [],
			};

			const method = await writeFile(
				["workouts", `${id}.json`],
				JSON.stringify(data, null, 2),
			);

			// Verify the file was actually written
			const verifyRoot = await navigator.storage.getDirectory();
			const verifyDir = await verifyRoot.getDirectoryHandle("workouts");
			const verifyHandle = await verifyDir.getFileHandle(`${id}.json`);
			const verifyFile = await verifyHandle.getFile();
			const verifyText = await verifyFile.text();

			if (!verifyText) {
				setError(`Written via ${method} but file is empty`);
				return;
			}

			setShowModal(false);
			setNewWorkoutName("");
			await props.onCreated?.();
		} catch (err) {
			const msg = err instanceof Error ? err.message : JSON.stringify(err);
			setError(msg);
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
						<Show when={error()}>
							<div class="text-error text-sm mb-2 break-all">{error()}</div>
						</Show>
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

export default CreateWorkoutModal;
