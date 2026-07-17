import { getRootDir } from "./get-root-dir";
import { validateImportData } from "./validate-import-data";

export async function importAllData(file: File): Promise<number> {
	const text = await file.text();
	const data = validateImportData(JSON.parse(text));

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
		const writable = await fileHandle.createWritable();
		await writable.write(entry.content);
		await writable.close();
		count++;
	}

	return count;
}
