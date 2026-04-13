import { getDir, getRootDir, writeFile } from "./utils";

type ExportedFile = {
	path: string;
	content: string;
};

type ExportData = {
	version: 1;
	exportedAt: string;
	files: ExportedFile[];
};

async function readAllFiles(
	dir: FileSystemDirectoryHandle,
	basePath: string,
): Promise<ExportedFile[]> {
	const files: ExportedFile[] = [];

	for await (const [name, handle] of dir.entries()) {
		const fullPath = basePath ? `${basePath}/${name}` : name;

		if (handle.kind === "file") {
			const file = await (handle as FileSystemFileHandle).getFile();
			const content = await file.text();
			files.push({ path: fullPath, content });
		} else {
			const subFiles = await readAllFiles(
				handle as FileSystemDirectoryHandle,
				fullPath,
			);
			files.push(...subFiles);
		}
	}

	return files;
}

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

export async function importAllData(file: File): Promise<number> {
	const text = await file.text();
	const data: ExportData = JSON.parse(text);

	if (data.version !== 1 || !Array.isArray(data.files)) {
		throw new Error("Invalid backup file format");
	}

	const root = await getRootDir();
	let count = 0;

	for (const entry of data.files) {
		const parts = entry.path.split("/");
		let dir = root;

		// Create all intermediate directories
		for (let i = 0; i < parts.length - 1; i++) {
			dir = await dir.getDirectoryHandle(parts[i], { create: true });
		}

		const fileName = parts.at(-1);
		if (!fileName) continue;
		const fileHandle = await dir.getFileHandle(fileName, { create: true });
		await writeFile(fileHandle, entry.content);
		count++;
	}

	return count;
}
