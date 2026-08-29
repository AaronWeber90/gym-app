import { describe, expect, it, vi } from "vitest";
import { exportAllData } from "./export-all-data";

describe("exportAllData", () => {
	it("returns all workout files as backup data", async () => {
		const workoutsDir = {
			entries: () =>
				[
					[
						"push.json",
						{
							kind: "file",
							getFile: () =>
								Promise.resolve({
									text: () => Promise.resolve('{"name":"Push"}'),
								}),
						},
					],
				][Symbol.iterator](),
		} as unknown as FileSystemDirectoryHandle;

		const rootDir = {
			getDirectoryHandle: vi.fn().mockResolvedValue(workoutsDir),
		} as unknown as FileSystemDirectoryHandle;

		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn().mockResolvedValue(rootDir) },
		});

		const result = await exportAllData();

		expect(result.version).toBe(1);
		expect(result.exportedAt).toEqual(expect.any(String));
		expect(result.files).toEqual([
			{ path: "workouts/push.json", content: '{"name":"Push"}' },
		]);
	});
});
