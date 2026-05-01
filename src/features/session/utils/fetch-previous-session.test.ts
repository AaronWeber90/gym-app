import { describe, expect, it, vi } from "vitest";
import { fetchPreviousSession } from "./fetch-previous-session";

const makeSession = (id: string, date: string) => ({
	id,
	parentId: "workout-1",
	name: "Push",
	date,
	created_at: date,
	exercises: [{ name: "Bench Press", sets: [{ weight: 80, reps: 10 }] }],
});

const makeFileEntry = (id: string, data: object) =>
	[
		`${id}.json`,
		{
			kind: "file",
			getFile: vi.fn().mockResolvedValue({
				text: vi.fn().mockResolvedValue(JSON.stringify(data)),
			}),
		},
	] as const;

const stubOpfs = (entries: ReturnType<typeof makeFileEntry>[]) => {
	const parentDir = {
		entries: vi.fn().mockReturnValue(entries[Symbol.iterator]()),
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
	return { parentDir, workoutsDir };
};

describe("fetchPreviousSession", () => {
	it("returns the most recent session before the current one", async () => {
		const older = makeSession("s1", "2026-01-01T10:00:00Z");
		const previous = makeSession("s2", "2026-01-05T10:00:00Z");
		const current = makeSession("s3", "2026-01-10T10:00:00Z");

		stubOpfs([
			makeFileEntry("s1", older),
			makeFileEntry("s2", previous),
			makeFileEntry("s3", current),
		]);

		const result = await fetchPreviousSession(
			"workout-1",
			"s3",
			"2026-01-10T10:00:00Z",
		);

		expect(result).toEqual(previous);
	});

	it("returns null when no previous session exists", async () => {
		const current = makeSession("s1", "2026-01-01T10:00:00Z");

		stubOpfs([makeFileEntry("s1", current)]);

		const result = await fetchPreviousSession(
			"workout-1",
			"s1",
			"2026-01-01T10:00:00Z",
		);

		expect(result).toBeNull();
	});

	it("skips sessions with dates after the current one", async () => {
		const older = makeSession("s1", "2026-01-01T10:00:00Z");
		const current = makeSession("s2", "2026-01-05T10:00:00Z");
		const newer = makeSession("s3", "2026-01-10T10:00:00Z");

		stubOpfs([
			makeFileEntry("s1", older),
			makeFileEntry("s2", current),
			makeFileEntry("s3", newer),
		]);

		const result = await fetchPreviousSession(
			"workout-1",
			"s2",
			"2026-01-05T10:00:00Z",
		);

		expect(result).toEqual(older);
	});

	it("returns null when workout directory does not exist", async () => {
		const workoutsDir = {
			getDirectoryHandle: vi.fn().mockRejectedValue(new Error("not found")),
		};
		const root = {
			getDirectoryHandle: vi.fn().mockResolvedValue(workoutsDir),
		};
		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn().mockResolvedValue(root) },
		});

		const result = await fetchPreviousSession(
			"workout-1",
			"s1",
			"2026-01-01T10:00:00Z",
		);

		expect(result).toBeNull();
	});
});
