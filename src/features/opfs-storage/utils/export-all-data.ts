import { getDir } from "./get-dir";
import { getRootDir } from "./get-root-dir";
import { readAllFiles } from "./read-all-files";
import type { ExportData } from "./read-all-files";

export async function exportAllData(): Promise<void> {
	const root = await getRootDir();
	const workoutsDir = await getDir(root, "workouts", true);

	const files = await readAllFiles(workoutsDir, "workouts");

	const exportData: ExportData = {
		version: 1,
		exportedAt: new Date().toISOString(),
		files,
	};

	const json = JSON.stringify(exportData, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = `gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
	a.click();
	URL.revokeObjectURL(url);
}
