import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWorkouts } from "./fetch-workouts";

vi.mock("../../opfs-storage/utils", () => ({
	getRootDir: vi.fn().mockResolvedValue({}),
	getDir: vi.fn(),
}));

vi.mock("./parse-workout-file", () => ({
	parseWorkoutFile: vi.fn(),
}));

import { getDir } from "../../opfs-storage/utils";
import { parseWorkoutFile } from "./parse-workout-file";

const mockedGetDir = vi.mocked(getDir);
const mockedParseWorkoutFile = vi.mocked(parseWorkoutFile);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("fetchWorkouts", () => {
	it("returns workouts sorted by created_at descending", async () => {
		const entries = [
			["old.json", { kind: "file" }],
			["new.json", { kind: "file" }],
		];

		mockedGetDir.mockResolvedValue({
			entries: vi.fn().mockImplementation(async function* () {
				yield* entries;
			}),
		} as unknown as FileSystemDirectoryHandle);

		mockedParseWorkoutFile
			.mockResolvedValueOnce({
				id: "old",
				name: "Old",
				created_at: "2026-01-01T00:00:00.000Z",
				lastTrainedAt: null,
				sessions: [],
			})
			.mockResolvedValueOnce({
				id: "new",
				name: "New",
				created_at: "2026-03-01T00:00:00.000Z",
				lastTrainedAt: null,
				sessions: [],
			});

		const result = await fetchWorkouts();

		expect(result).toHaveLength(2);
		expect(result[0].id).toBe("new");
		expect(result[1].id).toBe("old");
	});

	it("skips non-json entries", async () => {
		mockedGetDir.mockResolvedValue({
			entries: vi.fn().mockImplementation(async function* () {
				yield ["subdir", { kind: "directory" }];
				yield ["notes.txt", { kind: "file" }];
			}),
		} as unknown as FileSystemDirectoryHandle);

		const result = await fetchWorkouts();

		expect(result).toEqual([]);
		expect(mockedParseWorkoutFile).not.toHaveBeenCalled();
	});

	it("returns empty array on error", async () => {
		mockedGetDir.mockRejectedValue(new Error("OPFS unavailable"));

		const result = await fetchWorkouts();

		expect(result).toEqual([]);
	});
});
