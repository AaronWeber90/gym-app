import type { ExportData } from "./read-all-files";

const SEGMENT_PATTERN = /^[A-Za-z0-9_.-]+$/;

function validatePath(path: unknown, index: number): void {
	if (typeof path !== "string" || path.length === 0) {
		throw new Error(`Invalid backup file: entry ${index} has no path`);
	}

	const segments = path.split("/");
	for (const segment of segments) {
		if (segment === "" || segment === "." || segment === "..") {
			throw new Error(
				`Invalid backup file: entry ${index} has an invalid path segment in "${path}"`,
			);
		}
		if (!SEGMENT_PATTERN.test(segment)) {
			throw new Error(
				`Invalid backup file: entry ${index} has disallowed characters in "${path}"`,
			);
		}
	}
}

function validateContent(content: unknown, index: number): void {
	if (typeof content !== "string") {
		throw new Error(`Invalid backup file: entry ${index} has non-text content`);
	}
}

/**
 * Validates an untrusted backup payload before any OPFS write happens.
 * Rejects the whole import (throws) if any entry is malformed — no
 * partial writes for structurally invalid backups.
 */
export function validateImportData(data: unknown): ExportData {
	if (
		typeof data !== "object" ||
		data === null ||
		(data as { version?: unknown }).version !== 1 ||
		!Array.isArray((data as { files?: unknown }).files)
	) {
		throw new Error("Invalid backup file format");
	}

	const { files } = data as { files: unknown[] };

	files.forEach((entry, index) => {
		if (typeof entry !== "object" || entry === null) {
			throw new Error(`Invalid backup file: entry ${index} is not an object`);
		}
		const { path, content } = entry as { path?: unknown; content?: unknown };
		validatePath(path, index);
		validateContent(content, index);
	});

	return data as ExportData;
}
