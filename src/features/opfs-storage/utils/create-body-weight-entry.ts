import type { BodyWeightEntry, CreateBodyWeightInput } from "@api";
import { getFile } from "./get-file";
import { getRootBodyWeightDir } from "./get-root-body-weight-dir";

export const createBodyWeightEntry = async (
	input: CreateBodyWeightInput,
): Promise<BodyWeightEntry> => {
	const bodyWeightDir = await getRootBodyWeightDir();
	const id = crypto.randomUUID();
	const entry: BodyWeightEntry = {
		id,
		weight: input.weight,
		date: input.date ?? new Date().toISOString(),
		created_at: new Date().toISOString(),
	};
	const handle = await getFile(bodyWeightDir, `${id}.json`, true);
	const writable = await handle.createWritable();

	await writable.write(JSON.stringify(entry, null, 2));
	await writable.close();

	return entry;
};
