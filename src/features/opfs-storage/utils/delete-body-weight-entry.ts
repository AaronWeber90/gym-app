import { getRootBodyWeightDir } from "./get-root-body-weight-dir";

export const deleteBodyWeightEntry = async (id: string): Promise<void> => {
	const bodyWeightDir = await getRootBodyWeightDir();
	await bodyWeightDir.removeEntry(`${id}.json`);
};
