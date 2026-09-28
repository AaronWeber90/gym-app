import { describe, expect, it, vi } from "vitest";
import { getRootBodyWeightDir } from "./get-root-body-weight-dir";

describe("getRootBodyWeightDir", () => {
	it("gets root dir then gets 'body-weight' subdir with create: true", async () => {
		const bodyWeightDir = { kind: "directory" } as FileSystemDirectoryHandle;
		const rootDir = {
			getDirectoryHandle: vi.fn().mockResolvedValue(bodyWeightDir),
		} as unknown as FileSystemDirectoryHandle;

		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn().mockResolvedValue(rootDir) },
		});

		const result = await getRootBodyWeightDir();

		expect(result).toBe(bodyWeightDir);
		expect(rootDir.getDirectoryHandle).toHaveBeenCalledWith("body-weight", {
			create: true,
		});
	});
});
