import { createResource, For, Show } from "solid-js";

async function readDirectoryEntries(dirHandle, path = "") {
	const entries = [];
	const processedDirs = new Set();

	for await (const [name, handle] of dirHandle.entries()) {
		const fullPath = path ? `${path}/${name}` : name;

		if (handle.kind === "directory") {
			// Check if this directory has a corresponding .json file (parent workout)
			let displayName = name;
			let skipDir = false;

			try {
				const jsonFileName = `${name}.json`;
				const jsonHandle = await dirHandle.getFileHandle(jsonFileName);
				const jsonFile = await jsonHandle.getFile();
				const jsonText = await jsonFile.text();
				const data = JSON.parse(jsonText);

				// This directory represents child workouts of a parent
				if (data?.name) {
					displayName = data.name;
				}
				processedDirs.add(name);
			} catch (err) {
				// No corresponding JSON file, just a regular directory
			}

			// Skip if this directory already has a corresponding JSON file we'll process
			const jsonExists = await dirHandle
				.getFileHandle(`${name}.json`)
				.then(() => true)
				.catch(() => false);
			if (jsonExists && !processedDirs.has(name)) {
				skipDir = true;
			}

			if (!skipDir) {
				entries.push({
					type: "folder",
					name,
					displayName,
					path: fullPath,
					children: await readDirectoryEntries(handle, fullPath),
				});
			}
		} else {
			// It's a file
			let displayName = name;
			let additionalInfo = "";

			try {
				if (name.endsWith(".json")) {
					const file = await handle.getFile();
					const text = await file.text();
					const data = JSON.parse(text);

					// Check if this is a parent workout with a corresponding directory
					const dirName = name.replace(".json", "");
					const hasChildDir = await dirHandle
						.getDirectoryHandle(dirName)
						.then(() => true)
						.catch(() => false);

					if (hasChildDir) {
						// This is a parent workout - show it as a folder with children
						const childDir = await dirHandle.getDirectoryHandle(dirName);
						entries.push({
							type: "folder",
							name: dirName,
							displayName: data?.name || dirName,
							path: fullPath.replace(".json", ""),
							children: await readDirectoryEntries(
								childDir,
								fullPath.replace(".json", ""),
							),
						});
						continue; // Skip adding as file
					}

					// Regular JSON file or child workout
					if (data?.name) displayName = data.name;
					if (data?.date) {
						const formattedDate = new Intl.DateTimeFormat("de-DE").format(
							new Date(data.date),
						);
						additionalInfo = ` (${formattedDate})`;
					}
				}
			} catch (err) {
				// ignore invalid JSON
			}

			entries.push({
				type: "file",
				name,
				displayName: displayName + additionalInfo,
				path: fullPath,
			});
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
	const [entries, { refetch }] = createResource(fetchOpfsStructure);

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
					<FileTree entries={entries()} />
				</ul>
			</Show>
		</div>
	);
};

const FileTree = (props) => (
	<For each={props.entries}>
		{(entry) => (
			<li>
				<Show
					when={entry.type === "folder"}
					fallback={
						<a>
							<FileIcon /> {entry.displayName ?? entry.name}
						</a>
					}
				>
					<details open>
						<summary class="flex items-center gap-1">
							<FolderIcon /> {entry.displayName ?? entry.name}
						</summary>
						<ul>
							<FileTree entries={entry.children} />
						</ul>
					</details>
				</Show>
			</li>
		)}
	</For>
);

export default OpfsExplorer;
