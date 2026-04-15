export type SetData = {
	weight: number;
	reps: number;
};

export type ExerciseData = {
	name: string;
	sets: SetData[];
};

export type SessionData = {
	id: string;
	parentId: string;
	name: string;
	date: string;
	created_at: string;
	exercises: ExerciseData[];
};
