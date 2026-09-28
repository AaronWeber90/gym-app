import { describe, expect, it, vi } from "vitest";
import { getFile } from "./get-file";
import { getRootBodyWeightDir } from "./get-root-body-weight-dir";
import { saveBodyWeightEntry } from "./save-body-weight-entry";

vi.mock("./get-root-body-weight-dir", () => ({
	getRootBodyWeightDir: vi.fn(),
}));
vi.mock("./get-file", () => ({ getFile: vi.fn() }));

describe("saveBodyWeightEntry", () => {
	it("overwrites the entry file with the given data", async () => {
		const bodyWeightDir = {} as FileSystemDirectoryHandle;
		const writable = { write: vi.fn(), close: vi.fn() };
		vi.mocked(getRootBodyWeightDir).mockResolvedValue(bodyWeightDir);
		vi.mocked(getFile).mockResolvedValue({
			createWritable: vi.fn().mockResolvedValue(writable),
		} as unknown as FileSystemFileHandle);

		const entry = {
			id: "entry-1",
			weight: 79.5,
			date: "2026-08-29T12:00:00.000Z",
			created_at: "2026-08-29T12:00:00.000Z",
		};

		const result = await saveBodyWeightEntry(entry);

		expect(getFile).toHaveBeenCalledWith(bodyWeightDir, "entry-1.json", true);
		expect(writable.write).toHaveBeenCalledWith(JSON.stringify(entry, null, 2));
		expect(writable.close).toHaveBeenCalledOnce();
		expect(result).toBe(entry);
	});
});
