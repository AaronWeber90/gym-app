export type SetData = {
	weight: number;
	reps: number;
	rpe?: number;
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

export type WorkoutSession = {
	id: string;
	date: string;
};

export type Workout = {
	id: string;
	name: string;
	created_at: string;
	lastTrainedAt: string | null;
	sessions: WorkoutSession[];
};

export type WorkoutSessionSummary = {
	id: string;
	name: string;
	date: string;
	created_at: string;
	session: SessionData;
};

export type OverviewSession = {
	workoutId: string;
	workoutName: string;
	sessionId: string;
	date: string;
	exercises: ExerciseData[];
};

export type StorageUsage = {
	usage: number;
	quota: number;
};

export type ExportedFile = {
	path: string;
	content: string;
};

export type ExportData = {
	version: 1;
	exportedAt: string;
	files: ExportedFile[];
};

export type CreateWorkoutInput = {
	name: string;
};

export type CreateSessionInput = {
	workoutId: string;
	exercises: ExerciseData[];
};

export type BodyWeightEntry = {
	id: string;
	weight: number;
	date: string;
	created_at: string;
};

export type CreateBodyWeightInput = {
	weight: number;
	date?: string;
};
