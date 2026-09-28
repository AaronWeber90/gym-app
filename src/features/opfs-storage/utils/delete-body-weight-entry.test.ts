import { describe, expect, it, vi } from "vitest";
import { deleteBodyWeightEntry } from "./delete-body-weight-entry";
import { getRootBodyWeightDir } from "./get-root-body-weight-dir";

vi.mock("./get-root-body-weight-dir", () => ({
	getRootBodyWeightDir: vi.fn(),
}));

describe("deleteBodyWeightEntry", () => {
	it("removes the entry's json file from the body-weight directory", async () => {
		const removeEntry = vi.fn();
		const bodyWeightDir = {
			removeEntry,
		} as unknown as FileSystemDirectoryHandle;
		vi.mocked(getRootBodyWeightDir).mockResolvedValue(bodyWeightDir);

		await deleteBodyWeightEntry("entry-1");

		expect(removeEntry).toHaveBeenCalledWith("entry-1.json");
	});
});
