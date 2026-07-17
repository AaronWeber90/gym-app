import { describe, expect, it } from "vitest";
import { validateImportData } from "./validate-import-data";

describe("validateImportData", () => {
	it("returns the data unchanged for a valid backup", () => {
		const backup = {
			version: 1,
			exportedAt: "2026-01-01",
			files: [{ path: "workouts/push.json", content: '{"name":"Push"}' }],
		};

		expect(validateImportData(backup)).toEqual(backup);
	});

	it("throws on wrong version", () => {
		expect(() => validateImportData({ version: 2, files: [] })).toThrow(
			"Invalid backup file format",
		);
	});

	it("throws when files is missing", () => {
		expect(() => validateImportData({ version: 1 })).toThrow(
			"Invalid backup file format",
		);
	});

	it("throws on non-object input", () => {
		expect(() => validateImportData(null)).toThrow(
			"Invalid backup file format",
		);
		expect(() => validateImportData("not an object")).toThrow(
			"Invalid backup file format",
		);
	});

	it("throws on a '..' path segment", () => {
		const backup = {
			version: 1,
			files: [{ path: "workouts/../etc/passwd", content: "x" }],
		};

		expect(() => validateImportData(backup)).toThrow(/invalid path segment/);
	});

	it("throws on a '.' path segment", () => {
		const backup = {
			version: 1,
			files: [{ path: "workouts/./push.json", content: "x" }],
		};

		expect(() => validateImportData(backup)).toThrow(/invalid path segment/);
	});

	it("throws on an empty path segment (leading slash)", () => {
		const backup = {
			version: 1,
			files: [{ path: "/workouts/push.json", content: "x" }],
		};

		expect(() => validateImportData(backup)).toThrow(/invalid path segment/);
	});

	it("throws on an empty path segment (double slash)", () => {
		const backup = {
			version: 1,
			files: [{ path: "workouts//push.json", content: "x" }],
		};

		expect(() => validateImportData(backup)).toThrow(/invalid path segment/);
	});

	it("throws on disallowed characters in the path (e.g. spaces)", () => {
		const backup = {
			version: 1,
			files: [{ path: "workouts/push plan.json", content: "x" }],
		};

		expect(() => validateImportData(backup)).toThrow(/disallowed characters/);
	});

	it("throws on non-string content", () => {
		const backup = {
			version: 1,
			files: [{ path: "workouts/push.json", content: { not: "a string" } }],
		};

		expect(() => validateImportData(backup)).toThrow(/non-text content/);
	});

	it("throws when an entry is not an object", () => {
		const backup = { version: 1, files: ["not-an-entry"] };

		expect(() => validateImportData(backup)).toThrow(/is not an object/);
	});
});
