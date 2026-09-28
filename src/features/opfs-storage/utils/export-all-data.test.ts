import { describe, expect, it, vi } from "vitest";
import { exportAllData } from "./export-all-data";

const emptyDir = {
	entries: () => [][Symbol.iterator](),
} as unknown as FileSystemDirectoryHandle;

const dirWithFile = (fileName: string, content: string) =>
	({
		entries: () =>
			[
				[
					fileName,
					{
						kind: "file",
						getFile: () =>
							Promise.resolve({ text: () => Promise.resolve(content) }),
					},
				],
			][Symbol.iterator](),
	}) as unknown as FileSystemDirectoryHandle;

const stubRootDir = (dirName: string, dir: FileSystemDirectoryHandle) => {
	const rootDir = {
		getDirectoryHandle: vi.fn((name: string) =>
			Promise.resolve(name === dirName ? dir : emptyDir),
		),
	} as unknown as FileSystemDirectoryHandle;

	vi.stubGlobal("navigator", {
		storage: { getDirectory: vi.fn().mockResolvedValue(rootDir) },
	});
};

describe("exportAllData - workouts", () => {
	it("returns all workout files as backup data", async () => {
		stubRootDir("workouts", dirWithFile("push.json", '{"name":"Push"}'));

		const result = await exportAllData();

		expect(result.version).toBe(1);
		expect(result.exportedAt).toEqual(expect.any(String));
		expect(result.files).toEqual([
			{ path: "workouts/push.json", content: '{"name":"Push"}' },
		]);
	});
});

describe("exportAllData - body-weight", () => {
	it("includes body-weight files, tolerating a missing dir on old installs", async () => {
		stubRootDir("body-weight", dirWithFile("entry-1.json", '{"weight":80}'));

		const result = await exportAllData();

		expect(result.files).toEqual([
			{ path: "body-weight/entry-1.json", content: '{"weight":80}' },
		]);
	});
});
