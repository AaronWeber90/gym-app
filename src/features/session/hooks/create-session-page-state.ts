import { useNavigate, useParams } from "@solidjs/router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { createEffect, createMemo, createSignal, on } from "solid-js";
import { overviewSessionsQueryKey } from "../../overview/utils/fetch-overview-sessions";
import {
	createSortableList,
	debounce,
	deleteSession,
	type ExerciseData,
	fetchPreviousSession,
	fetchSession,
	type SetData,
	saveSession,
} from "../utils";
import { childWorkoutsQueryKey } from "../../workout/hooks/create-child-workouts-resource";

export const createSessionPageState = () => {
	const params = useParams<{ id: string; sessionId: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [exercises, setExercises] = createSignal<ExerciseData[]>([]);

	const sessionQuery = createQuery(() => ({
		queryKey: ["workoutSession", params.id, params.sessionId],
		queryFn: () => fetchSession(params.id, params.sessionId),
		enabled: !!params.id && !!params.sessionId,
	}));

	const session = () => sessionQuery.data;
	const sessionId = createMemo(() => session()?.id);

	const previousSessionQuery = createQuery(() => ({
		queryKey: ["previousSession", params.id, params.sessionId],
		queryFn: () => {
			const date = session()?.date;
			if (!date) throw new Error("Session date not available");
			return fetchPreviousSession(params.id, params.sessionId, date);
		},
		enabled: !!session()?.date,
	}));

	const previousExerciseMap = createMemo(() => {
		const prev = previousSessionQuery.data;
		if (!prev?.exercises) return new Map<string, SetData[]>();
		const map = new Map<string, SetData[]>();
		for (const ex of prev.exercises) {
			map.set(ex.name.toLowerCase(), ex.sets);
		}
		return map;
	});

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
			const trimmedExercises = exercises().map((ex) => ({
				...ex,
				name: ex.name.trim(),
			}));
			const data = { ...s, exercises: trimmedExercises };
			await saveSession(params.id, params.sessionId, data);

			queryClient.invalidateQueries({
				queryKey: childWorkoutsQueryKey(params.id),
			});
			queryClient.invalidateQueries({
				queryKey: overviewSessionsQueryKey,
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

	const moveExercise = (fromIndex: number, toIndex: number) => {
		const list = [...exercises()];
		const [item] = list.splice(fromIndex, 1);
		list.splice(toIndex, 0, item);
		setExercises(list);
		persistSession();
	};

	const sortable = createSortableList({
		getLength: () => exercises().length,
		onReorder: moveExercise,
	});

	const handleDeleteSession = async () => {
		try {
			await deleteSession(params.id, params.sessionId);
			await queryClient.invalidateQueries({
				queryKey: childWorkoutsQueryKey(params.id),
			});
			await queryClient.invalidateQueries({
				queryKey: overviewSessionsQueryKey,
			});
			navigate(`/workouts/${params.id}`);
		} catch (err) {
			console.error("Failed to delete workout session:", err);
		}
	};

	return {
		// State
		exercises,
		session,
		sessionQuery,
		previousExerciseMap,

		// Handlers
		updateExerciseName,
		updateSet,
		addSet,
		removeSet,
		addExercise,
		removeExercise,
		sortable,
		handleDeleteSession,
	};
};
