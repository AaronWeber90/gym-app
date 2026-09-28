import type {
	BodyWeightEntry,
	CreateBodyWeightInput,
	CreateSessionInput,
	CreateWorkoutInput,
	ExportData,
	OverviewSession,
	SessionData,
	StorageUsage,
	Workout,
	WorkoutSessionSummary,
} from "./types";

export type DataClient = {
	getWorkouts(): Promise<Workout[]>;
	createWorkout(input: CreateWorkoutInput): Promise<Workout>;
	deleteWorkout(workoutId: string): Promise<void>;
	getWorkoutSessions(workoutId: string): Promise<WorkoutSessionSummary[]>;
	createSession(input: CreateSessionInput): Promise<SessionData>;
	getSession(workoutId: string, sessionId: string): Promise<SessionData>;
	getPreviousSession(
		workoutId: string,
		sessionId: string,
		sessionDate: string,
	): Promise<SessionData | null>;
	saveSession(
		workoutId: string,
		sessionId: string,
		session: SessionData,
	): Promise<SessionData>;
	deleteSession(workoutId: string, sessionId: string): Promise<void>;
	getOverviewSessions(): Promise<OverviewSession[]>;
	getStorageUsage(): Promise<StorageUsage>;
	getBodyWeightEntries(): Promise<BodyWeightEntry[]>;
	createBodyWeightEntry(input: CreateBodyWeightInput): Promise<BodyWeightEntry>;
	saveBodyWeightEntry(entry: BodyWeightEntry): Promise<BodyWeightEntry>;
	exportData(): Promise<ExportData>;
	importData(data: ExportData): Promise<number>;
};
