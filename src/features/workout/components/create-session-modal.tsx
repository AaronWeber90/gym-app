import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

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
	const navigate = useNavigate();
	const isEdit = () => !!props.session;

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

	const handleCreateSession = async () => {
		try {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: true,
			});

			const parentDir = await workoutsDir.getDirectoryHandle(props.parentId, {
				create: true,
			});

			const sessionId = crypto.randomUUID();
			const handle = await parentDir.getFileHandle(`${sessionId}.json`, {
				create: true,
			});
			const writable = await handle.createWritable();

			// Prepare exercises: use previous exercises with reset weights, or one placeholder
			let exercises: ExerciseInput[] = [];
			if (props.previousExercises?.length) {
				const normalized = normalizeExercises(props.previousExercises);
				exercises = normalized.map((ex) => ({
					name: ex.name,
					sets: ex.sets.map((s) => ({ weight: 0, reps: s.reps })),
				}));
			} else {
				exercises = [{ name: "", sets: [{ weight: 0, reps: 1 }] }];
			}

			const now = new Date().toISOString();
			const data = {
				id: sessionId,
				parentId: props.parentId,
				name: "",
				date: now,
				created_at: now,
				exercises,
			};

			await writable.write(JSON.stringify(data, null, 2));
			await writable.close();
			await props.onSaved?.();

			// Navigate to session page
			navigate(`/workouts/${props.parentId}/${sessionId}`);
		} catch (err) {
			console.error("Failed to create workout session:", err);
			alert("Fehler beim Erstellen der Trainingseinheit");
		}
	};

	return (
		<Show when={!isEdit()}>
			<div class="fab fab-overwrite pb-4">
				<button
					class="btn btn-lg btn-circle btn-primary"
					onClick={handleCreateSession}
					aria-label="Trainingseinheit hinzufügen"
					type="button"
				>
					+
				</button>
			</div>
		</Show>
	);
};

export default SessionModal;
