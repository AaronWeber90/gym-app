import { getDir, getRootDir } from "../../opfs-storage/utils";
import type { SessionData } from "../../session/utils";
import type { OverviewSession } from "./calculate-overview-insights";

export const overviewSessionsQueryKey = ["overviewSessions"] as const;

const parseWorkoutIdFromFile = (fileName: string) =>
	fileName.replace(".json", "");

const toOverviewSession = (
	workoutId: string,
	workoutName: string,
	session: SessionData,
): OverviewSession => ({
	workoutId,
	workoutName,
	sessionId: session.id,
	date: session.date,
	exercises: Array.isArray(session.exercises) ? session.exercises : [],
});

const isJsonFileHandle = (
	name: string,
	handle: FileSystemHandle,
): handle is FileSystemFileHandle =>
	handle.kind === "file" && name.endsWith(".json");

const readWorkoutMeta = async (
	fileHandle: FileSystemFileHandle,
): Promise<{ id?: string; name?: string }> => {
	const workoutFile = await fileHandle.getFile();
	const workoutContent = await workoutFile.text();
	return JSON.parse(workoutContent) as {
		id?: string;
		name?: string;
	};
};

const readSessionFile = async (fileHandle: FileSystemFileHandle) => {
	const file = await fileHandle.getFile();
	const text = await file.text();
	return JSON.parse(text) as SessionData;
};

const collectWorkoutSessions = async (
	workoutsDir: FileSystemDirectoryHandle,
	workoutId: string,
	workoutName: string,
) => {
	let sessionDir: FileSystemDirectoryHandle;
	try {
		sessionDir = await workoutsDir.getDirectoryHandle(workoutId, {
			create: false,
		});
	} catch {
		return [];
	}

	const sessions: OverviewSession[] = [];

	for await (const [sessionFileName, sessionHandle] of sessionDir.entries()) {
		if (!isJsonFileHandle(sessionFileName, sessionHandle)) continue;

		try {
			const sessionData = await readSessionFile(sessionHandle);
			sessions.push(toOverviewSession(workoutId, workoutName, sessionData));
		} catch (error) {
			console.warn("Failed to parse overview session file:", error);
		}
	}

	return sessions;
};

export const fetchOverviewSessions = async (): Promise<OverviewSession[]> => {
	try {
		const root = await getRootDir();
		const workoutsDir = await getDir(root, "workouts", true);
		const sessions: OverviewSession[] = [];

		for await (const [fileName, fileHandle] of workoutsDir.entries()) {
			if (!isJsonFileHandle(fileName, fileHandle)) continue;

			try {
				const workoutData = await readWorkoutMeta(fileHandle);
				const workoutId = workoutData.id ?? parseWorkoutIdFromFile(fileName);
				const workoutName = workoutData.name ?? "Unbenanntes Workout";
				const workoutSessions = await collectWorkoutSessions(
					workoutsDir,
					workoutId,
					workoutName,
				);
				sessions.push(...workoutSessions);
			} catch (error) {
				console.warn("Failed to parse workout metadata file:", error);
			}
		}

		return sessions.toSorted(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);
	} catch (error) {
		console.error("Failed to fetch overview sessions:", error);
		return [];
	}
};
