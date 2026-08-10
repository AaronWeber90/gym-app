import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchOverviewSessions } from "./fetch-overview-sessions";

vi.mock("../../opfs-storage/utils", () => ({
	getRootDir: vi.fn().mockResolvedValue({}),
	getDir: vi.fn(),
}));

import { getDir } from "../../opfs-storage/utils";

const mockedGetDir = vi.mocked(getDir);

const asJsonFileHandle = (name: string, data: unknown): FileSystemFileHandle =>
	({
		kind: "file",
		name,
		getFile: vi.fn().mockResolvedValue({
			text: vi.fn().mockResolvedValue(JSON.stringify(data)),
		}),
		createWritable: vi.fn(),
		isSameEntry: vi.fn(),
	}) as unknown as FileSystemFileHandle;

const createDirectoryHandle = (params: {
	entries: () => AsyncGenerator<[string, FileSystemHandle]>;
	getDirectoryHandle?: (name: string) => Promise<FileSystemDirectoryHandle>;
}): FileSystemDirectoryHandle =>
	({
		kind: "directory",
		name: "mock",
		entries: vi.fn().mockImplementation(params.entries),
		getDirectoryHandle:
			params.getDirectoryHandle ??
			vi.fn().mockRejectedValue(new Error("Missing dir")),
		getFileHandle: vi.fn(),
		removeEntry: vi.fn(),
		resolve: vi.fn(),
		keys: vi.fn(),
		values: vi.fn(),
		[Symbol.asyncIterator]: vi.fn(),
		isSameEntry: vi.fn(),
	}) as unknown as FileSystemDirectoryHandle;

const makeSessionsDir = (
	fileName: string,
	session: unknown,
): FileSystemDirectoryHandle =>
	createDirectoryHandle({
		entries: async function* () {
			yield [fileName, asJsonFileHandle(fileName, session)];
		},
	});

const pushSession = {
	id: "s1",
	parentId: "w1",
	name: "Push",
	date: "2026-06-01T08:00:00.000Z",
	created_at: "2026-06-01T08:00:00.000Z",
	exercises: [],
};

const pullSession = {
	id: "s2",
	parentId: "w2",
	name: "Pull",
	date: "2026-06-02T08:00:00.000Z",
	created_at: "2026-06-02T08:00:00.000Z",
	exercises: [{ name: "Klimmzug", sets: [{ weight: 0, reps: 8 }] }],
};

const mismatchedIdSession = {
	id: "other-id",
	parentId: "w1",
	name: "Push",
	date: "2026-06-01T08:00:00.000Z",
	created_at: "2026-06-01T08:00:00.000Z",
	exercises: [],
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("fetchOverviewSessions", () => {
	it("returns parsed sessions sorted by date desc", async () => {
		const pushSessionsDir = makeSessionsDir("s1.json", pushSession);
		const pullSessionsDir = makeSessionsDir("s2.json", pullSession);

		const workoutsDir = createDirectoryHandle({
			entries: async function* () {
				yield [
					"w1.json",
					asJsonFileHandle("w1.json", { id: "w1", name: "Push" }),
				];
				yield [
					"w2.json",
					asJsonFileHandle("w2.json", { id: "w2", name: "Pull" }),
				];
			},
			getDirectoryHandle: async (id: string) => {
				if (id === "w1") return pushSessionsDir;
				if (id === "w2") return pullSessionsDir;
				throw new Error("Missing dir");
			},
		});

		mockedGetDir.mockResolvedValue(workoutsDir);

		const result = await fetchOverviewSessions();

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			sessionId: "s2",
			workoutName: "Pull",
		});
		expect(result[1]).toMatchObject({
			sessionId: "s1",
			workoutName: "Push",
		});
	});

	it("uses the session filename as sessionId when JSON id differs", async () => {
		const sessionsDir = makeSessionsDir("canonical.json", mismatchedIdSession);

		const workoutsDir = createDirectoryHandle({
			entries: async function* () {
				yield [
					"w1.json",
					asJsonFileHandle("w1.json", { id: "w1", name: "Push" }),
				];
			},
			getDirectoryHandle: async () => sessionsDir,
		});

		mockedGetDir.mockResolvedValue(workoutsDir);

		const result = await fetchOverviewSessions();

		expect(result).toHaveLength(1);
		expect(result[0]?.sessionId).toBe("canonical");
	});
});

describe("fetchOverviewSessions error handling", () => {
	it("returns empty array when root access fails", async () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockedGetDir.mockRejectedValue(new Error("OPFS unavailable"));

		const result = await fetchOverviewSessions();

		expect(result).toEqual([]);
		spy.mockRestore();
	});
});
