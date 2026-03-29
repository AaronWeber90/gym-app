import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Show } from "solid-js";
import { formatDate } from "../utils/format-date";

type OpfsEntry = {
	type: "folder" | "file";
	name: string;
	displayName: string;
	path: string;
	children?: OpfsEntry[];
};

async function tryReadJsonFile(
	dirHandle: FileSystemDirectoryHandle,
	fileName: string,
): Promise<{ name?: string; date?: string } | null> {
	try {
		const fileHandle = await dirHandle.getFileHandle(fileName);
		const file = await fileHandle.getFile();
		const text = await file.text();
		return JSON.parse(text);
	} catch {
		return null;
	}
}

async function hasHandle(
	dirHandle: FileSystemDirectoryHandle,
	name: string,
	kind: "file" | "directory",
): Promise<boolean> {
	try {
		if (kind === "file") {
			await dirHandle.getFileHandle(name);
		} else {
			await dirHandle.getDirectoryHandle(name);
		}
		return true;
	} catch {
		return false;
	}
}

async function processDirectoryEntry(
	name: string,
	handle: FileSystemDirectoryHandle,
	dirHandle: FileSystemDirectoryHandle,
	fullPath: string,
	processedDirs: Set<string>,
): Promise<OpfsEntry | null> {
	const data = await tryReadJsonFile(dirHandle, `${name}.json`);
	const displayName = data?.name ?? name;

	if (data) {
		processedDirs.add(name);
	}

	const jsonExists = await hasHandle(dirHandle, `${name}.json`, "file");
	if (jsonExists && !processedDirs.has(name)) {
		return null;
	}

	return {
		type: "folder",
		name,
		displayName,
		path: fullPath,
		children: await readDirectoryEntries(handle, fullPath),
	};
}

function buildFileEntry(
	name: string,
	fullPath: string,
	data: { name?: string; date?: string } | null,
): OpfsEntry {
	const displayName = data?.name ?? name;
	const additionalInfo = data?.date ? ` (${formatDate(data.date)})` : "";
	return {
		type: "file",
		name,
		displayName: displayName + additionalInfo,
		path: fullPath,
	};
}

async function processFileEntry(
	name: string,
	dirHandle: FileSystemDirectoryHandle,
	fullPath: string,
): Promise<OpfsEntry> {
	if (!name.endsWith(".json")) {
		return buildFileEntry(name, fullPath, null);
	}

	const data = await tryReadJsonFile(dirHandle, name);
	if (!data) {
		return buildFileEntry(name, fullPath, null);
	}

	const dirName = name.replace(".json", "");
	const childDirExists = await hasHandle(dirHandle, dirName, "directory");

	if (childDirExists) {
		const childDir = await dirHandle.getDirectoryHandle(dirName);
		return {
			type: "folder",
			name: dirName,
			displayName: data.name ?? dirName,
			path: fullPath.replace(".json", ""),
			children: await readDirectoryEntries(
				childDir,
				fullPath.replace(".json", ""),
			),
		};
	}

	return buildFileEntry(name, fullPath, data);
}

async function readDirectoryEntries(
	dirHandle: FileSystemDirectoryHandle,
	path = "",
): Promise<OpfsEntry[]> {
	const entries: OpfsEntry[] = [];
	const processedDirs = new Set<string>();

	for await (const [name, handle] of dirHandle.entries()) {
		const fullPath = path ? `${path}/${name}` : name;

		if (handle.kind === "directory") {
			const entry = await processDirectoryEntry(
				name,
				handle as FileSystemDirectoryHandle,
				dirHandle,
				fullPath,
				processedDirs,
			);
			if (entry) entries.push(entry);
		} else {
			const entry = await processFileEntry(name, dirHandle, fullPath);
			if (entry) entries.push(entry);
		}
	}
	return entries;
}

async function fetchOpfsStructure() {
	try {
		const root = await navigator.storage.getDirectory();
		return await readDirectoryEntries(root);
	} catch (err) {
		console.error("Failed to read OPFS:", err);
		return [];
	}
}

// --- Icons ---
const FolderIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="h-4 w-4"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
		/>
		<title>folder-open-icon</title>
	</svg>
);

const FileIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="h-4 w-4"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
		/>
		<title>file-icon</title>
	</svg>
);

// --- Components ---
const OpfsExplorer = () => {
	const queryClient = useQueryClient();
	const entriesQuery = createQuery(() => ({
		queryKey: ["opfs-structure"],
		queryFn: fetchOpfsStructure,
		throwOnError: true,
	}));
	const entries = () => entriesQuery.data;
	const refetch = () =>
		queryClient.invalidateQueries({ queryKey: ["opfs-structure"] });

	const deleteAllData = async () => {
		const confirmed = confirm(
			"Are you sure you want to delete ALL data? This action cannot be undone.",
		);
		if (!confirmed) return;

		try {
			const root = await navigator.storage.getDirectory();

			// Delete all entries in the root directory
			for await (const [name, handle] of root.entries()) {
				try {
					if (handle.kind === "directory") {
						await root.removeEntry(name, { recursive: true });
					} else {
						await root.removeEntry(name);
					}
					console.log(`Deleted: ${name}`);
				} catch (err) {
					console.error(`Failed to delete ${name}:`, err);
				}
			}

			// Refresh the view
			refetch();
			alert("All data has been deleted successfully.");
		} catch (err) {
			console.error("Failed to delete OPFS data:", err);
			alert("Failed to delete data. Check console for details.");
		}
	};

	return (
		<div class="p-6">
			<div class="flex justify-between items-center mb-4">
				<h1 class="text-2xl font-bold">🗂️ OPFS File Explorer</h1>
				<button
					class="btn btn-error btn-sm"
					onClick={deleteAllData}
					type="button"
				>
					Delete All Data
				</button>
			</div>

			<Show when={entries()} fallback={<p>No entries found.</p>}>
				<ul class="menu menu-xs bg-base-200 rounded-box max-w-xs w-full">
					<FileTree entries={entries() ?? []} />
				</ul>
			</Show>
		</div>
	);
};

const FileTree = (props: { entries: OpfsEntry[] }) => (
	<For each={props.entries}>
		{(entry) => (
			<li>
				<Show
					when={entry.type === "folder"}
					fallback={
						<button class="btn btn-ghost btn-sm" type="button">
							<FileIcon /> {entry.displayName ?? entry.name}
						</button>
					}
				>
					<details open>
						<summary class="flex items-center gap-1">
							<FolderIcon /> {entry.displayName ?? entry.name}
						</summary>
						<ul>
							<FileTree entries={entry.children ?? []} />
						</ul>
					</details>
				</Show>
			</li>
		)}
	</For>
);

export default OpfsExplorer;
