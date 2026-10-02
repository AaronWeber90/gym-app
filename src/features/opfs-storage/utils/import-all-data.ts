import { getRootDir } from "./get-root-dir";
import { validateImportData } from "./validate-import-data";

export async function importAllData(data: unknown): Promise<number> {
	const validatedData = validateImportData(data);
	const root = await getRootDir();
	let count = 0;

	for (const entry of validatedData.files) {
		const parts = entry.path.split("/");
		let dir = root;

		// Create all intermediate directories
		for (let i = 0; i < parts.length - 1; i++) {
			// biome-ignore lint/performance/noAwaitInLoops: each level needs the parent handle
			dir = await dir.getDirectoryHandle(parts[i], { create: true });
		}

		const fileName = parts.at(-1);
		if (!fileName) {
			continue;
		}
		const fileHandle = await dir.getFileHandle(fileName, { create: true });
		const writable = await fileHandle.createWritable();
		await writable.write(entry.content);
		await writable.close();
		count += 1;
	}

	return count;
}
