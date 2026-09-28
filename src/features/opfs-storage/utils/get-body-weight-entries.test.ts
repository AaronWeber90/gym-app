import { describe, expect, it, vi } from "vitest";
import { getBodyWeightEntries } from "./get-body-weight-entries";
import { getRootBodyWeightDir } from "./get-root-body-weight-dir";

vi.mock("./get-root-body-weight-dir", () => ({
	getRootBodyWeightDir: vi.fn(),
}));

const makeFileHandle = (content: unknown) => ({
	kind: "file",
	getFile: () =>
		Promise.resolve({ text: () => Promise.resolve(JSON.stringify(content)) }),
});

describe("getBodyWeightEntries", () => {
	it("returns entries sorted by date ascending", async () => {
		const bodyWeightDir = {
			entries: () =>
				[
					[
						"b.json",
						makeFileHandle({
							id: "b",
							weight: 81,
							date: "2026-02-01T00:00:00.000Z",
							created_at: "2026-02-01T00:00:00.000Z",
						}),
					],
					[
						"a.json",
						makeFileHandle({
							id: "a",
							weight: 80,
							date: "2026-01-01T00:00:00.000Z",
							created_at: "2026-01-01T00:00:00.000Z",
						}),
					],
				][Symbol.iterator](),
		} as unknown as FileSystemDirectoryHandle;

		vi.mocked(getRootBodyWeightDir).mockResolvedValue(bodyWeightDir);

		const result = await getBodyWeightEntries();

		expect(result.map((e) => e.id)).toEqual(["a", "b"]);
	});

	it("returns an empty array when the directory has no entries", async () => {
		const bodyWeightDir = {
			entries: () => [][Symbol.iterator](),
		} as unknown as FileSystemDirectoryHandle;

		vi.mocked(getRootBodyWeightDir).mockResolvedValue(bodyWeightDir);

		expect(await getBodyWeightEntries()).toEqual([]);
	});

	it("returns an empty array when reading the directory fails", async () => {
		vi.mocked(getRootBodyWeightDir).mockRejectedValue(new Error("no access"));

		expect(await getBodyWeightEntries()).toEqual([]);
	});
});
