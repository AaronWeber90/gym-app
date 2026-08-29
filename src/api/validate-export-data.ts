import type { ExportData } from "./types";

const SEGMENT_PATTERN = /^[A-Za-z0-9_.-]+$/;

const validatePath = (path: unknown, index: number) => {
	if (typeof path !== "string" || path.length === 0) {
		throw new Error(`Invalid backup file: entry ${index} has no path`);
	}

	for (const segment of path.split("/")) {
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
};

export const validateExportData = (data: unknown): ExportData => {
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
		if (typeof content !== "string") {
			throw new TypeError(
				`Invalid backup file: entry ${index} has non-text content`,
			);
		}
	});

	return data as ExportData;
};
