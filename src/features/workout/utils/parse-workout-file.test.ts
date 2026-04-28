import { describe, expect, it, vi } from "vitest";
import { parseWorkoutFile } from "./parse-workout-file";

vi.mock("./get-sessions-and-last-trained-date", () => ({
	getSessionsAndLastTrainedDate: vi.fn().mockResolvedValue({
		lastTrainedAt: "2026-03-15T00:00:00.000Z",
		sessions: [{ id: "s1", date: "2026-03-15T00:00:00.000Z" }],
	}),
}));

const createMockFileHandle = (data: object) =>
	({
		getFile: vi.fn().mockResolvedValue({
			text: vi.fn().mockResolvedValue(JSON.stringify(data)),
		}),
	}) as unknown as FileSystemFileHandle;

const mockWorkoutsDir = {} as FileSystemDirectoryHandle;

describe("parseWorkoutFile", () => {
	it("parses a workout file and returns a Workout", async () => {
		const fileHandle = createMockFileHandle({
			id: "w1",
			name: "Push Day",
			created_at: "2026-01-01T00:00:00.000Z",
		});

		const result = await parseWorkoutFile(
			"w1.json",
			fileHandle,
			mockWorkoutsDir,
		);

		expect(result).toEqual({
			id: "w1",
			name: "Push Day",
			created_at: "2026-01-01T00:00:00.000Z",
			lastTrainedAt: "2026-03-15T00:00:00.000Z",
			sessions: [{ id: "s1", date: "2026-03-15T00:00:00.000Z" }],
		});
	});

	it("uses filename as id when id is missing from data", async () => {
		const fileHandle = createMockFileHandle({
			name: "Leg Day",
			created_at: "2026-02-01T00:00:00.000Z",
		});

		const result = await parseWorkoutFile(
			"leg-day.json",
			fileHandle,
			mockWorkoutsDir,
		);

		expect(result.id).toBe("leg-day");
	});

	it("defaults created_at when missing from data", async () => {
		const fileHandle = createMockFileHandle({
			id: "w2",
			name: "Pull Day",
		});

		const result = await parseWorkoutFile(
			"w2.json",
			fileHandle,
			mockWorkoutsDir,
		);

		expect(result.created_at).toBeDefined();
		expect(new Date(result.created_at).getTime()).not.toBeNaN();
	});
});
