import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBodyWeightEntry } from "./create-body-weight-entry";
import { getFile } from "./get-file";
import { getRootBodyWeightDir } from "./get-root-body-weight-dir";

vi.mock("./get-root-body-weight-dir", () => ({
	getRootBodyWeightDir: vi.fn(),
}));
vi.mock("./get-file", () => ({ getFile: vi.fn() }));

describe("createBodyWeightEntry", () => {
	beforeEach(() => {
		vi.stubGlobal("crypto", { randomUUID: () => "entry-1" });
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-29T12:00:00.000Z"));
	});

	it("persists and returns a new body weight entry with default date", async () => {
		const bodyWeightDir = {} as FileSystemDirectoryHandle;
		const writable = { write: vi.fn(), close: vi.fn() };
		vi.mocked(getRootBodyWeightDir).mockResolvedValue(bodyWeightDir);
		vi.mocked(getFile).mockResolvedValue({
			createWritable: vi.fn().mockResolvedValue(writable),
		} as unknown as FileSystemFileHandle);

		const result = await createBodyWeightEntry({ weight: 82.5 });

		expect(getFile).toHaveBeenCalledWith(bodyWeightDir, "entry-1.json", true);
		expect(writable.write).toHaveBeenCalledWith(
			JSON.stringify(
				{
					id: "entry-1",
					weight: 82.5,
					date: "2026-08-29T12:00:00.000Z",
					created_at: "2026-08-29T12:00:00.000Z",
				},
				null,
				2,
			),
		);
		expect(writable.close).toHaveBeenCalledOnce();
		expect(result).toEqual({
			id: "entry-1",
			weight: 82.5,
			date: "2026-08-29T12:00:00.000Z",
			created_at: "2026-08-29T12:00:00.000Z",
		});
	});

	it("uses the provided date instead of now", async () => {
		const bodyWeightDir = {} as FileSystemDirectoryHandle;
		const writable = { write: vi.fn(), close: vi.fn() };
		vi.mocked(getRootBodyWeightDir).mockResolvedValue(bodyWeightDir);
		vi.mocked(getFile).mockResolvedValue({
			createWritable: vi.fn().mockResolvedValue(writable),
		} as unknown as FileSystemFileHandle);

		const result = await createBodyWeightEntry({
			weight: 80,
			date: "2026-01-01T08:00:00.000Z",
		});

		expect(result.date).toBe("2026-01-01T08:00:00.000Z");
	});
});
