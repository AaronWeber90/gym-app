import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWorkout } from "./create-workout";
import { getDir } from "./get-dir";
import { getFile } from "./get-file";
import { getRootDir } from "./get-root-dir";

vi.mock("./get-root-dir", () => ({ getRootDir: vi.fn() }));
vi.mock("./get-dir", () => ({ getDir: vi.fn() }));
vi.mock("./get-file", () => ({ getFile: vi.fn() }));

describe("createWorkout", () => {
	beforeEach(() => {
		vi.stubGlobal("crypto", { randomUUID: () => "workout-1" });
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-29T12:00:00.000Z"));
	});

	it("persists and returns a new workout", async () => {
		const root = {} as FileSystemDirectoryHandle;
		const workoutsDir = {} as FileSystemDirectoryHandle;
		const writable = { write: vi.fn(), close: vi.fn() };
		vi.mocked(getRootDir).mockResolvedValue(root);
		vi.mocked(getDir).mockResolvedValue(workoutsDir);
		vi.mocked(getFile).mockResolvedValue({
			createWritable: vi.fn().mockResolvedValue(writable),
		} as unknown as FileSystemFileHandle);

		const result = await createWorkout({ name: "Push" });

		expect(getDir).toHaveBeenCalledWith(root, "workouts", true);
		expect(getFile).toHaveBeenCalledWith(workoutsDir, "workout-1.json", true);
		expect(writable.write).toHaveBeenCalledWith(
			JSON.stringify(
				{
					id: "workout-1",
					name: "Push",
					created_at: "2026-08-29T12:00:00.000Z",
				},
				null,
				2,
			),
		);
		expect(writable.close).toHaveBeenCalledOnce();
		expect(result).toEqual({
			id: "workout-1",
			name: "Push",
			created_at: "2026-08-29T12:00:00.000Z",
			lastTrainedAt: null,
			sessions: [],
		});
	});
});
