import { describe, expect, it, vi } from "vitest";
import { getFile } from "./get-file";

describe("getFile", () => {
	it("calls parent.getFileHandle with name and create: false by default", async () => {
		const mockFile = { kind: "file" } as FileSystemFileHandle;
		const parent = {
			getFileHandle: vi.fn().mockResolvedValue(mockFile),
		} as unknown as FileSystemDirectoryHandle;

		const result = await getFile(parent, "data.json");

		expect(result).toBe(mockFile);
		expect(parent.getFileHandle).toHaveBeenCalledWith("data.json", {
			create: false,
		});
	});

	it("passes create: true when specified", async () => {
		const mockFile = { kind: "file" } as FileSystemFileHandle;
		const parent = {
			getFileHandle: vi.fn().mockResolvedValue(mockFile),
		} as unknown as FileSystemDirectoryHandle;

		await getFile(parent, "new.json", true);

		expect(parent.getFileHandle).toHaveBeenCalledWith("new.json", {
			create: true,
		});
	});
});
