import { useParams } from "@solidjs/router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import {
	createEffect,
	createMemo,
	createSignal,
	Index,
	on,
	Show,
} from "solid-js";
import { ExerciseBlock } from "../features/session/components/exercise-block";
import {
	debounce,
	type ExerciseData,
	fetchSession,
	type SetData,
	saveSession,
} from "../features/session/utils";
import { childWorkoutsQueryKey } from "../features/workout/create-child-workouts-resource";
import { formatDate } from "../utils/format-date";

const WorkoutSession = () => {
	const params = useParams();
	const queryClient = useQueryClient();

	const [exercises, setExercises] = createSignal<ExerciseData[]>([]);

	const sessionQuery = createQuery(() => ({
		queryKey: ["workoutSession", params.id, params.sessionId],
		queryFn: () => fetchSession(params.id, params.sessionId),
		enabled: !!params.id && !!params.sessionId,
	}));

	const session = () => sessionQuery.data;
	const sessionId = createMemo(() => session()?.id);

	createEffect(
		on(sessionId, () => {
			const s = session();
			if (s?.exercises) {
				setExercises(
					s.exercises.map((ex) => ({
						name: ex.name,
						sets: Array.isArray(ex.sets)
							? ex.sets.map((set) => ({ weight: set.weight, reps: set.reps }))
							: Array.from({ length: Number(ex.sets) || 1 }, () => ({
									weight: 0,
									reps: 1,
								})),
					})),
				);
			}
		}),
	);

	const persistSession = async () => {
		const s = session();
		if (!s) return;

		try {
			const data = { ...s, exercises: exercises() };
			await saveSession(params.id, params.sessionId, data);

			queryClient.setQueryData(
				["workoutSession", params.id, params.sessionId],
				data,
			);
			queryClient.invalidateQueries({
				queryKey: childWorkoutsQueryKey(params.id),
			});
		} catch (err) {
			console.error("Failed to save workout session:", err);
		}
	};

	const debouncedSave = debounce(persistSession, 500);

	const updateExerciseName = (index: number, name: string) => {
		setExercises(
			exercises().map((ex, i) => (i === index ? { ...ex, name } : ex)),
		);
		debouncedSave();
	};

	const updateSet = (
		exIndex: number,
		setIndex: number,
		field: keyof SetData,
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
		debouncedSave();
	};

	const addSet = (exIndex: number) => {
		const lastSet = exercises()[exIndex]?.sets.at(-1);
		const newSet = lastSet
			? { weight: lastSet.weight, reps: lastSet.reps }
			: { weight: 0, reps: 1 };
		setExercises(
			exercises().map((ex, i) =>
				i === exIndex ? { ...ex, sets: [...ex.sets, newSet] } : ex,
			),
		);
		persistSession();
	};

	const removeSet = (exIndex: number, setIndex: number) => {
		setExercises(
			exercises().map((ex, i) =>
				i === exIndex
					? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
					: ex,
			),
		);
		persistSession();
	};

	const addExercise = () => {
		setExercises([
			...exercises(),
			{ name: "", sets: [{ weight: 0, reps: 1 }] },
		]);
	};

	const removeExercise = (index: number) => {
		setExercises(exercises().filter((_, i) => i !== index));
		persistSession();
	};

	return (
		<Show
			when={!sessionQuery.error}
			fallback={
				<div class="text-center py-12 text-error">
					Session konnte nicht geladen werden
				</div>
			}
		>
			<Show when={session()} fallback={<div class="min-h-screen" />}>
				{(s) => (
					<div>
						<h1 class="text-2xl font-bold mb-1">
							{formatDate(s().date, {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							})}
						</h1>
						<p class="text-sm text-base-content/60 mb-6">
							Gestartet um{" "}
							{formatDate(s().date, { hour: "2-digit", minute: "2-digit" })}
						</p>

						<div class="space-y-6">
							<Index each={exercises()}>
								{(ex, exIndex) => (
									<ExerciseBlock
										exercise={ex()}
										canRemove={exercises().length > 1}
										onNameChange={(name) => updateExerciseName(exIndex, name)}
										onUpdateSet={(setIndex, field, value) =>
											updateSet(exIndex, setIndex, field, value)
										}
										onAddSet={() => addSet(exIndex)}
										onRemoveSet={(setIndex) => removeSet(exIndex, setIndex)}
										onRemove={() => removeExercise(exIndex)}
									/>
								)}
							</Index>
						</div>

						<button
							class="btn btn-outline btn-sm w-full mt-4"
							onClick={addExercise}
							type="button"
						>
							+ Übung hinzufügen
						</button>
					</div>
				)}
			</Show>
		</Show>
	);
};

export default WorkoutSession;
