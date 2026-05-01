import { getDir, getRootDir } from "../../opfs-storage/utils";
import type { SessionData } from "./types";

export const fetchPreviousSession = async (
	workoutId: string,
	currentSessionId: string,
	currentSessionDate: string,
): Promise<SessionData | null> => {
	const root = await getRootDir();
	const workoutsDir = await getDir(root, "workouts", true);

	let parentDir: FileSystemDirectoryHandle;
	try {
		parentDir = await workoutsDir.getDirectoryHandle(workoutId, {
			create: false,
		});
	} catch {
		return null;
	}

	const currentDate = new Date(currentSessionDate).getTime();
	let bestSession: SessionData | null = null;
	let bestDate = -Infinity;

	for await (const [fileName, fileHandle] of parentDir.entries()) {
		if (fileHandle.kind !== "file" || !fileName.endsWith(".json")) continue;

		const sessionId = fileName.replace(".json", "");
		if (sessionId === currentSessionId) continue;

		try {
			const file = await (fileHandle as FileSystemFileHandle).getFile();
			const text = await file.text();
			const data: SessionData = JSON.parse(text);
			const date = new Date(data.date).getTime();

			if (date < currentDate && date > bestDate) {
				bestDate = date;
				bestSession = data;
			}
		} catch {
			// skip unreadable files
		}
	}

	return bestSession;
};
