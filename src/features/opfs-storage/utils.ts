export const getRootDir = async (): Promise<FileSystemDirectoryHandle> => {
	if (navigator.storage.persist) {
		await navigator.storage.persist();
	}
	return navigator.storage.getDirectory();
};

export const getDir = async (
	parent: FileSystemDirectoryHandle,
	name: string,
	create = false,
): Promise<FileSystemDirectoryHandle> => {
	return parent.getDirectoryHandle(name, { create });
};

export const getFile = async (
	parent: FileSystemDirectoryHandle,
	name: string,
	create = false,
): Promise<FileSystemFileHandle> => {
	return parent.getFileHandle(name, { create });
};

export const getRootWorkoutsDir =
	async (): Promise<FileSystemDirectoryHandle> => {
		const root = await getRootDir();
		return getDir(root, "workouts", true);
	};

export const writeFile = async (
	path: string[],
	content: string,
): Promise<string> => {
	const root = await navigator.storage.getDirectory();
	let dir = root;
	for (let i = 0; i < path.length - 1; i++) {
		dir = await dir.getDirectoryHandle(path[i], { create: true });
	}
	const fileName = path.at(-1);
	if (!fileName) throw new Error("writeFile: empty path");
	const handle = await dir.getFileHandle(fileName, {
		create: true,
	});

	// Try createWritable() first (Chrome, Firefox, Safari 26+)
	if (typeof handle.createWritable === "function") {
		try {
			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();
			return "createWritable";
		} catch {
			// createWritable may exist but throw on OPFS handles (older Safari)
		}
	}

	// Fallback: use createSyncAccessHandle in a Web Worker (Safari 15.2+)
	// FileSystemFileHandle can't be cloned on Safari, so the worker navigates OPFS by path
	await writeFileViaWorker(path, content);
	return "worker";
};

const writeFileViaWorker = (path: string[], content: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const workerCode = `
			self.onmessage = async (e) => {
				try {
					const { path, content } = e.data;
					const root = await navigator.storage.getDirectory();
					let dir = root;
					for (let i = 0; i < path.length - 1; i++) {
						dir = await dir.getDirectoryHandle(path[i], { create: true });
					}
					const handle = await dir.getFileHandle(path[path.length - 1], { create: true });
					const accessHandle = await handle.createSyncAccessHandle();
					const encoder = new TextEncoder();
					const encoded = encoder.encode(content);
					accessHandle.truncate(0);
					accessHandle.write(encoded);
					accessHandle.flush();
					accessHandle.close();
					self.postMessage({ ok: true });
				} catch (err) {
					self.postMessage({ ok: false, error: err.message });
				}
			};
		`;
		const blob = new Blob([workerCode], { type: "application/javascript" });
		const url = URL.createObjectURL(blob);
		const worker = new Worker(url);
		worker.onmessage = (e) => {
			worker.terminate();
			URL.revokeObjectURL(url);
			if (e.data.ok) resolve();
			else reject(new Error(e.data.error));
		};
		worker.onerror = (e) => {
			worker.terminate();
			URL.revokeObjectURL(url);
			reject(new Error(e.message));
		};
		worker.postMessage({ path, content });
	});
};
