import { describe, expect, it, vi } from "vitest";
import { getRootDir } from "./get-root-dir";

describe("getRootDir", () => {
	it("calls navigator.storage.getDirectory()", async () => {
		const mockDirHandle = { kind: "directory" } as FileSystemDirectoryHandle;
		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn().mockResolvedValue(mockDirHandle) },
		});

		const result = await getRootDir();

		expect(result).toBe(mockDirHandle);
		expect(navigator.storage.getDirectory).toHaveBeenCalledOnce();
	});
});
