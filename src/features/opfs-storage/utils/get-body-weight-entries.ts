import type { BodyWeightEntry } from "@api";
import { getRootBodyWeightDir } from "./get-root-body-weight-dir";

export const getBodyWeightEntries = async (): Promise<BodyWeightEntry[]> => {
	try {
		const bodyWeightDir = await getRootBodyWeightDir();
		const entries: BodyWeightEntry[] = [];

		for await (const [name, handle] of bodyWeightDir.entries()) {
			if (handle.kind !== "file" || !name.endsWith(".json")) {
				continue;
			}
			try {
				const file = await (handle as FileSystemFileHandle).getFile();
				const entry = JSON.parse(await file.text()) as BodyWeightEntry;
				entries.push(entry);
			} catch (error) {
				console.warn("Failed to read body weight entry:", error);
			}
		}

		return entries.toSorted(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);
	} catch (error) {
		console.error("Failed to load body weight entries:", error);
		return [];
	}
};
