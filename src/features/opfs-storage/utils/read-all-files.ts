import type { ExportedFile } from "@api";

export type { ExportData, ExportedFile } from "@api";

export async function readAllFiles(
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
