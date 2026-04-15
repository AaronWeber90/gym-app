import { describe, expect, it } from "vitest";
import { readAllFiles } from "./read-all-files";

function makeFileHandle(content: string): FileSystemHandle {
	return {
		kind: "file",
		getFile: () =>
			Promise.resolve({
				text: () => Promise.resolve(content),
			}),
	} as unknown as FileSystemHandle;
}

function makeDirHandle(
	entries: [string, FileSystemHandle][],
): FileSystemDirectoryHandle {
	return {
		kind: "directory",
		entries: () => entries[Symbol.iterator](),
	} as unknown as FileSystemDirectoryHandle;
}

describe("readAllFiles", () => {
	it("returns empty array for empty directory", async () => {
		const dir = makeDirHandle([]);
		const result = await readAllFiles(dir, "root");
		expect(result).toEqual([]);
	});

	it("reads a single file", async () => {
		const dir = makeDirHandle([["test.json", makeFileHandle('{"a":1}')]]);

		const result = await readAllFiles(dir, "workouts");

		expect(result).toEqual([{ path: "workouts/test.json", content: '{"a":1}' }]);
	});

	it("reads files from nested directories", async () => {
		const subDir = makeDirHandle([
			["session.json", makeFileHandle("session-data")],
		]);
		const dir = makeDirHandle([
			["workout.json", makeFileHandle("workout-data")],
			["sessions", subDir as unknown as FileSystemHandle],
		]);

		const result = await readAllFiles(dir, "workouts");

		expect(result).toEqual([
			{ path: "workouts/workout.json", content: "workout-data" },
			{
				path: "workouts/sessions/session.json",
				content: "session-data",
			},
		]);
	});

	it("uses name directly when basePath is empty", async () => {
		const dir = makeDirHandle([["file.json", makeFileHandle("content")]]);

		const result = await readAllFiles(dir, "");

		expect(result).toEqual([{ path: "file.json", content: "content" }]);
	});
});
