import { describe, expect, it, vi } from "vitest";
import { fetchSession } from "./fetch-session";

describe("fetchSession", () => {
	it("reads and parses the session JSON file", async () => {
		const sessionData = {
			id: "session-1",
			parentId: "workout-1",
			name: "Push",
			date: "2026-01-01",
			created_at: "2026-01-01",
			exercises: [],
		};

		const fileHandle = {
			getFile: vi.fn().mockResolvedValue({
				text: vi.fn().mockResolvedValue(JSON.stringify(sessionData)),
			}),
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

		const result = await fetchSession("workout-1", "session-1");

		expect(result).toEqual(sessionData);
		expect(workoutsDir.getDirectoryHandle).toHaveBeenCalledWith("workout-1", {
			create: false,
		});
		expect(parentDir.getFileHandle).toHaveBeenCalledWith("session-1.json");
	});
});
