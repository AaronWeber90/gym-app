import type { DataClient } from "@api";
import { fetchOverviewSessions } from "../overview/utils/fetch-overview-sessions";
import {
	deleteSession,
	fetchPreviousSession,
	fetchSession,
	saveSession,
} from "../session/utils";
import { fetchStorageUsage } from "../settings/utils/fetch-storage-usage";
import { deleteWorkout } from "../workout/utils/delete-workout";
import { fetchWorkouts } from "../workout/utils/fetch-workouts";
import { createBodyWeightEntry } from "./utils/create-body-weight-entry";
import { createSession } from "./utils/create-session";
import { createWorkout } from "./utils/create-workout";
import { exportAllData } from "./utils/export-all-data";
import { getBodyWeightEntries } from "./utils/get-body-weight-entries";
import { getWorkoutSessions } from "./utils/get-workout-sessions";
import { importAllData } from "./utils/import-all-data";
import { saveBodyWeightEntry } from "./utils/save-body-weight-entry";

export const opfsDataClient: DataClient = {
	getWorkouts: fetchWorkouts,
	createWorkout,
	deleteWorkout,
	getWorkoutSessions,
	createSession,
	getSession: fetchSession,
	getPreviousSession: fetchPreviousSession,
	saveSession,
	deleteSession,
	getOverviewSessions: fetchOverviewSessions,
	getStorageUsage: fetchStorageUsage,
	getBodyWeightEntries,
	createBodyWeightEntry,
	saveBodyWeightEntry,
	exportData: exportAllData,
	importData: importAllData,
};
