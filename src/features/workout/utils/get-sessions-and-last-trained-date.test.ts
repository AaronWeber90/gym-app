import { describe, expect, it, vi } from "vitest";
import { getSessionsAndLastTrainedDate } from "./get-sessions-and-last-trained-date";

const createFileEntry = (fileName: string, data: object) => {
	const fileHandle = {
		kind: "file" as const,
		getFile: vi.fn().mockResolvedValue({
			text: vi.fn().mockResolvedValue(JSON.stringify(data)),
		}),
	};
	return [fileName, fileHandle] as const;
};

const createMockDir = (entries: ReturnType<typeof createFileEntry>[]) => ({
	getDirectoryHandle: vi.fn().mockResolvedValue({
		entries: vi.fn().mockImplementation(async function* () {
			yield* entries;
		}),
	}),
});

describe("getSessionsAndLastTrainedDate", () => {
	it("returns sessions sorted by date (newest first) and lastTrainedAt", async () => {
		const entries = [
			createFileEntry("s1.json", { id: "s1", date: "2026-01-01" }),
			createFileEntry("s2.json", { id: "s2", date: "2026-03-15" }),
			createFileEntry("s3.json", { id: "s3", date: "2026-02-10" }),
		];

		const workoutsDir = createMockDir(entries);

		const result = await getSessionsAndLastTrainedDate(
			"workout-1",
			workoutsDir as unknown as FileSystemDirectoryHandle,
		);

		expect(result.lastTrainedAt).toBe(new Date("2026-03-15").toISOString());
		expect(result.sessions).toHaveLength(3);
		expect(result.sessions[0].id).toBe("s2");
		expect(result.sessions[1].id).toBe("s3");
		expect(result.sessions[2].id).toBe("s1");
	});

	it("falls back to created_at when date is missing", async () => {
		const entries = [
			createFileEntry("s1.json", { id: "s1", created_at: "2026-04-01" }),
		];
		const workoutsDir = createMockDir(entries);

		const result = await getSessionsAndLastTrainedDate(
			"workout-1",
			workoutsDir as unknown as FileSystemDirectoryHandle,
		);

		expect(result.lastTrainedAt).toBe(new Date("2026-04-01").toISOString());
		expect(result.sessions[0].id).toBe("s1");
	});

	it("uses filename as id when id is missing", async () => {
		const entries = [createFileEntry("abc.json", { date: "2026-01-01" })];
		const workoutsDir = createMockDir(entries);

		const result = await getSessionsAndLastTrainedDate(
			"workout-1",
			workoutsDir as unknown as FileSystemDirectoryHandle,
		);

		expect(result.sessions[0].id).toBe("abc");
	});

	it("returns empty when no directory exists", async () => {
		const workoutsDir = {
			getDirectoryHandle: vi.fn().mockRejectedValue(new Error("Not found")),
		};

		const result = await getSessionsAndLastTrainedDate(
			"workout-1",
			workoutsDir as unknown as FileSystemDirectoryHandle,
		);

		expect(result).toEqual({ lastTrainedAt: null, sessions: [] });
	});

	it("skips non-json files", async () => {
		const entries = [
			createFileEntry("s1.json", { id: "s1", date: "2026-01-01" }),
			["readme.txt", { kind: "file" }] as unknown as ReturnType<
				typeof createFileEntry
			>,
		];
		const workoutsDir = createMockDir(entries);

		const result = await getSessionsAndLastTrainedDate(
			"workout-1",
			workoutsDir as unknown as FileSystemDirectoryHandle,
		);

		expect(result.sessions).toHaveLength(1);
	});
});
