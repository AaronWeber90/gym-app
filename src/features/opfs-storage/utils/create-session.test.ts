import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSession } from "./create-session";
import { getDir } from "./get-dir";
import { getFile } from "./get-file";
import { getRootDir } from "./get-root-dir";

vi.mock("./get-root-dir", () => ({ getRootDir: vi.fn() }));
vi.mock("./get-dir", () => ({ getDir: vi.fn() }));
vi.mock("./get-file", () => ({ getFile: vi.fn() }));

describe("createSession", () => {
	beforeEach(() => {
		vi.stubGlobal("crypto", { randomUUID: () => "session-1" });
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-29T12:00:00.000Z"));
	});

	it("persists and returns a new session", async () => {
		const root = {} as FileSystemDirectoryHandle;
		const workoutsDir = {} as FileSystemDirectoryHandle;
		const workoutDir = {} as FileSystemDirectoryHandle;
		const writable = { write: vi.fn(), close: vi.fn() };
		vi.mocked(getRootDir).mockResolvedValue(root);
		vi.mocked(getDir)
			.mockResolvedValueOnce(workoutsDir)
			.mockResolvedValueOnce(workoutDir);
		vi.mocked(getFile).mockResolvedValue({
			createWritable: vi.fn().mockResolvedValue(writable),
		} as unknown as FileSystemFileHandle);
		const exercises = [
			{ name: "Bankdruecken", sets: [{ weight: 80, reps: 8 }] },
		];

		const result = await createSession({ workoutId: "workout-1", exercises });

		expect(getDir).toHaveBeenNthCalledWith(1, root, "workouts", true);
		expect(getDir).toHaveBeenNthCalledWith(2, workoutsDir, "workout-1", true);
		expect(getFile).toHaveBeenCalledWith(workoutDir, "session-1.json", true);
		expect(writable.write).toHaveBeenCalledWith(
			JSON.stringify(result, null, 2),
		);
		expect(writable.close).toHaveBeenCalledOnce();
		expect(result).toEqual({
			id: "session-1",
			parentId: "workout-1",
			name: "",
			date: "2026-08-29T12:00:00.000Z",
			created_at: "2026-08-29T12:00:00.000Z",
			exercises,
		});
	});
});
