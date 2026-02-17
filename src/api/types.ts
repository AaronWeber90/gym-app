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
