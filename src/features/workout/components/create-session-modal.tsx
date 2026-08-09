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

const buildInitialExercises = (
	previousExercises?: ExerciseInput[],
): ExerciseInput[] => {
	if (previousExercises?.length) {
		return normalizeExercises(previousExercises).map((ex) => ({
			name: ex.name,
			sets: ex.sets.map((s) => ({ weight: 0, reps: s.reps })),
		}));
	}
	return [{ name: "", sets: [{ weight: 0, reps: 1 }] }];
};

const createSession = async (args: {
	parentId: string;
	previousExercises?: ExerciseInput[];
	onSaved?: () => void | Promise<void>;
	navigate: (to: string) => void;
}) => {
	try {
		const root = await navigator.storage.getDirectory();
		const workoutsDir = await root.getDirectoryHandle("workouts", {
			create: true,
		});

		const parentDir = await workoutsDir.getDirectoryHandle(args.parentId, {
			create: true,
		});

		const sessionId = crypto.randomUUID();
		const handle = await parentDir.getFileHandle(`${sessionId}.json`, {
			create: true,
		});
		const writable = await handle.createWritable();

		const exercises = buildInitialExercises(args.previousExercises);

		const now = new Date().toISOString();
		const data = {
			id: sessionId,
			parentId: args.parentId,
			name: "",
			date: now,
			created_at: now,
			exercises,
		};

		await writable.write(JSON.stringify(data, null, 2));
		await writable.close();
		await args.onSaved?.();

		// Navigate to session page
		args.navigate(`/workouts/${args.parentId}/${sessionId}`);
	} catch (err) {
		console.error("Failed to create workout session:", err);
		alert("Fehler beim Erstellen der Trainingseinheit");
	}
};

const SessionModal = (props: SessionModalProps) => {
	const navigate = useNavigate();
	const isEdit = () => !!props.session;

	const handleCreateSession = () =>
		createSession({
			parentId: props.parentId,
			previousExercises: props.previousExercises,
			onSaved: props.onSaved,
			navigate,
		});

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
