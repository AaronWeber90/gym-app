import { describe, expect, it, vi } from "vitest";
import { importAllData } from "./import-all-data";

describe("importAllData", () => {
	it("throws on invalid backup format (wrong version)", async () => {
		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn() },
		});

		const file = new File(
			[JSON.stringify({ version: 2, files: [] })],
			"backup.json",
		);

		await expect(importAllData(file)).rejects.toThrow(
			"Invalid backup file format",
		);
	});

	it("throws on invalid backup format (missing files)", async () => {
		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn() },
		});

		const file = new File(
			[JSON.stringify({ version: 1 })],
			"backup.json",
		);

		await expect(importAllData(file)).rejects.toThrow(
			"Invalid backup file format",
		);
	});

	it("imports files and creates directories", async () => {
		const writable = { write: vi.fn(), close: vi.fn() };
		const fileHandle = { createWritable: vi.fn().mockResolvedValue(writable) };
		const subDir = {
			getDirectoryHandle: vi.fn(),
			getFileHandle: vi.fn().mockResolvedValue(fileHandle),
		};
		const mockRoot = {
			getDirectoryHandle: vi.fn().mockResolvedValue(subDir),
			getFileHandle: vi.fn().mockResolvedValue(fileHandle),
		};

		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn().mockResolvedValue(mockRoot) },
		});

		const backup = {
			version: 1,
			exportedAt: "2026-01-01",
			files: [
				{ path: "workouts/push.json", content: '{"name":"Push"}' },
			],
		};
		const file = new File([JSON.stringify(backup)], "backup.json");

		const count = await importAllData(file);

		expect(count).toBe(1);
		expect(mockRoot.getDirectoryHandle).toHaveBeenCalledWith("workouts", {
			create: true,
		});
		expect(subDir.getFileHandle).toHaveBeenCalledWith("push.json", {
			create: true,
		});
		expect(writable.write).toHaveBeenCalledWith('{"name":"Push"}');
		expect(writable.close).toHaveBeenCalledOnce();
	});

	it("returns 0 for empty files array", async () => {
		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn().mockResolvedValue({}) },
		});

		const backup = { version: 1, exportedAt: "2026-01-01", files: [] };
		const file = new File([JSON.stringify(backup)], "backup.json");

		const count = await importAllData(file);

		expect(count).toBe(0);
	});
});
