import { useNavigate, useParams } from "@solidjs/router";
import {
	createQuery,
	type QueryClient,
	useQueryClient,
} from "@tanstack/solid-query";
import { createEffect, createMemo, createSignal, on } from "solid-js";
import { normalizeExerciseName } from "../../exercises/utils";
import { overviewSessionsQueryKey } from "../../overview/utils/fetch-overview-sessions";
import { childWorkoutsQueryKey } from "../../workout/hooks/create-child-workouts-resource";
import {
	createSortableList,
	debounce,
	deleteSession,
	type ExerciseData,
	fetchPreviousSession,
	fetchSession,
	type SessionData,
	type SetData,
	saveSession,
} from "../utils";

type SessionParams = { id: string; sessionId: string };
type SessionAccessor = () => SessionData | undefined;
type ExercisesAccessor = () => ExerciseData[];
type Navigate = ReturnType<typeof useNavigate>;

type PersistDeps = {
	params: SessionParams;
	session: SessionAccessor;
	exercises: ExercisesAccessor;
	queryClient: QueryClient;
};

type ExerciseStoreDeps = {
	params: SessionParams;
	session: SessionAccessor;
	queryClient: QueryClient;
};

type DeleteDeps = {
	params: SessionParams;
	queryClient: QueryClient;
	navigate: Navigate;
};

const mapSessionExercises = (exercises: ExerciseData[]): ExerciseData[] =>
	exercises.map((ex) => ({
		name: ex.name,
		sets: Array.isArray(ex.sets)
			? ex.sets.map((set) => ({ weight: set.weight, reps: set.reps }))
			: Array.from({ length: Number(ex.sets) || 1 }, () => ({
					weight: 0,
					reps: 1,
				})),
	}));

const renameExercise = (list: ExerciseData[], index: number, name: string) =>
	list.map((ex, i) => (i === index ? { ...ex, name } : ex));

const updateSetValue = (
	list: ExerciseData[],
	exIndex: number,
	setIndex: number,
	patch: Partial<SetData>,
) =>
	list.map((ex, i) =>
		i === exIndex
			? {
					...ex,
					sets: ex.sets.map((s, si) =>
						si === setIndex ? { ...s, ...patch } : s,
					),
				}
			: ex,
	);

const appendSet = (list: ExerciseData[], exIndex: number) => {
	const lastSet = list[exIndex]?.sets.at(-1);
	const newSet = lastSet
		? { weight: lastSet.weight, reps: lastSet.reps }
		: { weight: 0, reps: 1 };
	return list.map((ex, i) =>
		i === exIndex ? { ...ex, sets: [...ex.sets, newSet] } : ex,
	);
};

const deleteSet = (list: ExerciseData[], exIndex: number, setIndex: number) =>
	list.map((ex, i) =>
		i === exIndex
			? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
			: ex,
	);

const moveItem = (list: ExerciseData[], fromIndex: number, toIndex: number) => {
	const next = [...list];
	const [item] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, item);
	return next;
};

const persistSession = async (deps: PersistDeps) => {
	const { params, session, exercises, queryClient } = deps;
	const s = session();
	if (!s) return;

	try {
		const trimmedExercises = exercises().map((ex) => ({
			...ex,
			name: ex.name.trim(),
		}));
		await saveSession(params.id, params.sessionId, {
			...s,
			id: params.sessionId,
			exercises: trimmedExercises,
		});
		queryClient.invalidateQueries({
			queryKey: childWorkoutsQueryKey(params.id),
		});
		queryClient.invalidateQueries({ queryKey: overviewSessionsQueryKey });
	} catch (err) {
		console.error("Failed to save workout session:", err);
	}
};

const deleteSessionAndNavigate = async (deps: DeleteDeps) => {
	const { params, queryClient, navigate } = deps;
	try {
		await deleteSession(params.id, params.sessionId);
		await queryClient.invalidateQueries({
			queryKey: childWorkoutsQueryKey(params.id),
		});
		await queryClient.invalidateQueries({ queryKey: overviewSessionsQueryKey });
		navigate(`/workouts/${params.id}`);
	} catch (err) {
		console.error("Failed to delete workout session:", err);
	}
};

const createSessionQueries = (params: SessionParams) => {
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
		const map = new Map<string, SetData[]>();
		for (const ex of prev?.exercises ?? []) {
			map.set(normalizeExerciseName(ex.name), ex.sets);
		}
		return map;
	});

	return { sessionQuery, session, sessionId, previousExerciseMap };
};

const createExerciseStore = (deps: ExerciseStoreDeps) => {
	const { params, session, queryClient } = deps;
	const [exercises, setExercises] = createSignal<ExerciseData[]>([]);

	const persist = () =>
		persistSession({ params, session, exercises, queryClient });
	const debouncedSave = debounce(persist, 500);

	const updateExerciseName = (index: number, name: string) => {
		setExercises(renameExercise(exercises(), index, name));
		debouncedSave();
	};
	const updateSet = (
		exIndex: number,
		setIndex: number,
		field: keyof SetData,
		value: number,
	) => {
		setExercises(
			updateSetValue(exercises(), exIndex, setIndex, { [field]: value }),
		);
		debouncedSave();
	};
	const addSet = (exIndex: number) => {
		setExercises(appendSet(exercises(), exIndex));
		persist();
	};
	const removeSet = (exIndex: number, setIndex: number) => {
		setExercises(deleteSet(exercises(), exIndex, setIndex));
		persist();
	};
	const addExercise = () => {
		setExercises([
			...exercises(),
			{ name: "", sets: [{ weight: 0, reps: 1 }] },
		]);
	};
	const removeExercise = (index: number) => {
		setExercises(exercises().filter((_, i) => i !== index));
		persist();
	};
	const moveExercise = (fromIndex: number, toIndex: number) => {
		setExercises(moveItem(exercises(), fromIndex, toIndex));
		persist();
	};

	return {
		exercises,
		setExercises,
		updateExerciseName,
		updateSet,
		addSet,
		removeSet,
		addExercise,
		removeExercise,
		moveExercise,
	};
};

export const createSessionPageState = () => {
	const params = useParams<SessionParams>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { sessionQuery, session, sessionId, previousExerciseMap } =
		createSessionQueries(params);

	const store = createExerciseStore({ params, session, queryClient });

	createEffect(
		on(sessionId, () => {
			const s = session();
			if (s?.exercises) store.setExercises(mapSessionExercises(s.exercises));
		}),
	);

	const sortable = createSortableList({
		getLength: () => store.exercises().length,
		onReorder: store.moveExercise,
	});

	const handleDeleteSession = () =>
		deleteSessionAndNavigate({ params, queryClient, navigate });

	return {
		// State
		exercises: store.exercises,
		session,
		sessionQuery,
		previousExerciseMap,

		// Handlers
		updateExerciseName: store.updateExerciseName,
		updateSet: store.updateSet,
		addSet: store.addSet,
		removeSet: store.removeSet,
		addExercise: store.addExercise,
		removeExercise: store.removeExercise,
		sortable,
		handleDeleteSession,
	};
};
