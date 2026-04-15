import { describe, expect, it, vi } from "vitest";
import { saveSession } from "./save-session";

describe("saveSession", () => {
	it("writes session data to OPFS and returns it", async () => {
		const writable = { write: vi.fn(), close: vi.fn() };
		const fileHandle = {
			createWritable: vi.fn().mockResolvedValue(writable),
		};
		const parentDir = {
			getFileHandle: vi.fn().mockResolvedValue(fileHandle),
		};
		const workoutsDir = {
			getDirectoryHandle: vi.fn().mockResolvedValue(parentDir),
		};
		const root = {
			getDirectoryHandle: vi.fn().mockResolvedValue(workoutsDir),
		};

		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn().mockResolvedValue(root) },
		});

		const session = {
			id: "session-1",
			parentId: "workout-1",
			name: "Push",
			date: "2026-01-01",
			created_at: "2026-01-01",
			exercises: [{ name: "Bench", sets: [{ weight: 80, reps: 8 }] }],
		};

		const result = await saveSession("workout-1", "session-1", session);

		expect(result).toEqual(session);
		expect(parentDir.getFileHandle).toHaveBeenCalledWith("session-1.json", {
			create: true,
		});
		expect(writable.write).toHaveBeenCalledWith(
			JSON.stringify(session, null, 2),
		);
		expect(writable.close).toHaveBeenCalledOnce();
	});
});
