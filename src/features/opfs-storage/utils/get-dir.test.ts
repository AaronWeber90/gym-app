import { describe, expect, it, vi } from "vitest";
import { getDir } from "./get-dir";

describe("getDir", () => {
	it("calls parent.getDirectoryHandle with name and create: false by default", async () => {
		const mockChild = { kind: "directory" } as FileSystemDirectoryHandle;
		const parent = {
			getDirectoryHandle: vi.fn().mockResolvedValue(mockChild),
		} as unknown as FileSystemDirectoryHandle;

		const result = await getDir(parent, "my-folder");

		expect(result).toBe(mockChild);
		expect(parent.getDirectoryHandle).toHaveBeenCalledWith("my-folder", {
			create: false,
		});
	});

	it("passes create: true when specified", async () => {
		const mockChild = { kind: "directory" } as FileSystemDirectoryHandle;
		const parent = {
			getDirectoryHandle: vi.fn().mockResolvedValue(mockChild),
		} as unknown as FileSystemDirectoryHandle;

		await getDir(parent, "new-folder", true);

		expect(parent.getDirectoryHandle).toHaveBeenCalledWith("new-folder", {
			create: true,
		});
	});
});
