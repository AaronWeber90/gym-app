import type { ExportData } from "@api";
import { getDir } from "./get-dir";
import { getRootDir } from "./get-root-dir";
import { readAllFiles } from "./read-all-files";

export async function exportAllData(): Promise<ExportData> {
	const root = await getRootDir();
	const workoutsDir = await getDir(root, "workouts", true);
	const bodyWeightDir = await getDir(root, "body-weight", true);

	const files = await readAllFiles(workoutsDir, "workouts");
	const bodyWeightFiles = await readAllFiles(bodyWeightDir, "body-weight");

	return {
		version: 1,
		exportedAt: new Date().toISOString(),
		files: [...files, ...bodyWeightFiles],
	};
}
