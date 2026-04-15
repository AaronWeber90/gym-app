import { describe, expect, it, vi } from "vitest";
import { exportAllData } from "./export-all-data";

describe("exportAllData", () => {
	it("creates a download link with backup JSON", async () => {
		const workoutsDir = {
			entries: () =>
				[
					[
						"push.json",
						{
							kind: "file",
							getFile: () =>
								Promise.resolve({
									text: () => Promise.resolve('{"name":"Push"}'),
								}),
						},
					],
				][Symbol.iterator](),
		} as unknown as FileSystemDirectoryHandle;

		const rootDir = {
			getDirectoryHandle: vi.fn().mockResolvedValue(workoutsDir),
		} as unknown as FileSystemDirectoryHandle;

		vi.stubGlobal("navigator", {
			storage: { getDirectory: vi.fn().mockResolvedValue(rootDir) },
		});

		const revokeObjectURL = vi.fn();
		const createObjectURL = vi.fn().mockReturnValue("blob:fake-url");
		vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

		const click = vi.fn();
		const anchor = { href: "", download: "", click };
		vi.stubGlobal("document", {
			createElement: vi.fn().mockReturnValue(anchor),
		});

		await exportAllData();

		expect(click).toHaveBeenCalledOnce();
		expect(anchor.href).toBe("blob:fake-url");
		expect(anchor.download).toMatch(/^gym-backup-\d{4}-\d{2}-\d{2}\.json$/);
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
	});
});
