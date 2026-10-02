import { dataClient, type SessionData } from "@api";
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
	if (previousExercises && previousExercises.length > 0) {
		return normalizeExercises(previousExercises).map((ex) => ({
			name: ex.name,
			sets: ex.sets.map((s) => ({ weight: 0, reps: s.reps })),
		}));
	}
	return [{ name: "", sets: [{ weight: 0, reps: 1 }] }];
};

export const SessionModal = (props: SessionModalProps) => {
	const navigate = useNavigate();
	const isEdit = () => Boolean(props.session);

	const handleCreateSession = async () => {
		try {
			const session = await dataClient.createSession({
				workoutId: props.parentId,
				exercises: buildInitialExercises(props.previousExercises),
			});
			await props.onSaved?.();
			navigate(`/workouts/${props.parentId}/${session.id}`);
		} catch (err) {
			console.error("Failed to create workout session:", err);
			// biome-ignore lint/suspicious/noAlert: no inline error UI in this modal yet
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
