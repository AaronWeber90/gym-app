import type { BodyWeightEntry } from "@api";
import { getFile } from "./get-file";
import { getRootBodyWeightDir } from "./get-root-body-weight-dir";

export const saveBodyWeightEntry = async (
	entry: BodyWeightEntry,
): Promise<BodyWeightEntry> => {
	const bodyWeightDir = await getRootBodyWeightDir();
	const handle = await getFile(bodyWeightDir, `${entry.id}.json`, true);
	const writable = await handle.createWritable();

	await writable.write(JSON.stringify(entry, null, 2));
	await writable.close();

	return entry;
};
