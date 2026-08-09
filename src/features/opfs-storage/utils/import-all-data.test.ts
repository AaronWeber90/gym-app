import { describe, expect, it, vi } from "vitest";
import { importAllData } from "./import-all-data";

function stubOpfs(root: unknown) {
	vi.stubGlobal("navigator", {
		storage: { getDirectory: vi.fn().mockResolvedValue(root) },
	});
}

function createMockOpfs() {
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
	return { writable, fileHandle, subDir, mockRoot };
}

function backupFile(data: unknown) {
	return new File([JSON.stringify(data)], "backup.json");
}

describe("importAllData validation", () => {
	it("throws on invalid backup format (wrong version)", async () => {
		stubOpfs({});

		const file = backupFile({ version: 2, files: [] });

		await expect(importAllData(file)).rejects.toThrow(
			"Invalid backup file format",
		);
	});

	it("throws on invalid backup format (missing files)", async () => {
		stubOpfs({});

		const file = backupFile({ version: 1 });

		await expect(importAllData(file)).rejects.toThrow(
			"Invalid backup file format",
		);
	});

	it("returns 0 for empty files array", async () => {
		stubOpfs({});

		const backup = { version: 1, exportedAt: "2026-01-01", files: [] };
		const count = await importAllData(backupFile(backup));

		expect(count).toBe(0);
	});
});

describe("importAllData file writing", () => {
	it("imports files and creates directories", async () => {
		const { writable, subDir, mockRoot } = createMockOpfs();
		stubOpfs(mockRoot);

		const backup = {
			version: 1,
			exportedAt: "2026-01-01",
			files: [{ path: "workouts/push.json", content: '{"name":"Push"}' }],
		};
		const count = await importAllData(backupFile(backup));

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

	it("writes nothing when the backup contains one valid and one invalid entry", async () => {
		const { writable, subDir, mockRoot } = createMockOpfs();
		stubOpfs(mockRoot);

		const backup = {
			version: 1,
			exportedAt: "2026-01-01",
			files: [
				{ path: "workouts/push.json", content: '{"name":"Push"}' },
				{ path: "workouts/../etc/passwd", content: "malicious" },
			],
		};

		await expect(importAllData(backupFile(backup))).rejects.toThrow(
			/invalid path segment/,
		);

		expect(mockRoot.getDirectoryHandle).not.toHaveBeenCalled();
		expect(subDir.getFileHandle).not.toHaveBeenCalled();
		expect(writable.write).not.toHaveBeenCalled();
	});
});
