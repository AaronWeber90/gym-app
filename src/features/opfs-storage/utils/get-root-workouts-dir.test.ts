import { describe, expect, it, vi } from "vitest";
import { getRootWorkoutsDir } from "./get-root-workouts-dir";

describe("getRootWorkoutsDir", () => {
	it("gets root dir then gets 'workouts' subdir with create: true", async () => {
		const workoutsDir = { kind: "directory" } as FileSystemDirectoryHandle;
		const rootDir = {
			getDirectoryHandle: vi.fn().mockResolvedValue(workoutsDir),
		} as unknown as FileSystemDirectoryHandle;

		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn().mockResolvedValue(rootDir) },
		});

		const result = await getRootWorkoutsDir();

		expect(result).toBe(workoutsDir);
		expect(rootDir.getDirectoryHandle).toHaveBeenCalledWith("workouts", {
			create: true,
		});
	});
});
