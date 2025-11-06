import { createResource, For, Show } from "solid-js";


async function readDirectoryEntries(dirHandle, path = "") {
    const entries = [];
    for await (const [name, handle] of dirHandle.entries()) {
        const fullPath = path ? `${path}/${name}` : name;
        if (handle.kind === "directory") {
            entries.push({
                type: "folder",
                name,
                path: fullPath,
                children: await readDirectoryEntries(handle, fullPath),
            });
        } else {
            entries.push({
                type: "file",
                name,
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
    </svg>
);

// --- Components ---
export const OpfsExplorer = () => {
    const [entries] = createResource(fetchOpfsStructure);

    return (
        <div class="p-6">
            <h1 class="text-2xl font-bold mb-4">🗂️ OPFS File Explorer</h1>

            <Show when={entries.loading}>
                <p class="loading loading-spinner loading-sm text-primary">Loading...</p>
            </Show>

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
                            <FileIcon /> {entry.name}
                        </a>
                    }
                >
                    <details open>
                        <summary class="flex items-center gap-1">
                            <FolderIcon /> {entry.name}
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
