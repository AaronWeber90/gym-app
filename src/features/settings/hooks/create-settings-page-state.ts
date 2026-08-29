import { dataClient, validateExportData } from "@api";
import { useQueryClient } from "@tanstack/solid-query";
import { createResource, createSignal } from "solid-js";

const downloadExport = (data: unknown) => {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
	anchor.click();
	URL.revokeObjectURL(url);
};

export const createSettingsPageState = () => {
	const queryClient = useQueryClient();
	const [exporting, setExporting] = createSignal(false);
	const [importing, setImporting] = createSignal(false);
	const [importResult, setImportResult] = createSignal<string | null>(null);
	const [storage] = createResource(() => dataClient.getStorageUsage());

	const handleExport = async () => {
		setExporting(true);
		try {
			downloadExport(await dataClient.exportData());
		} catch (e) {
			console.error("Export failed:", e);
		} finally {
			setExporting(false);
		}
	};

	const handleImport = async (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		setImporting(true);
		setImportResult(null);
		try {
			const data = validateExportData(JSON.parse(await file.text()));
			const count = await dataClient.importData(data);
			setImportResult(`${count} Dateien importiert`);
			await queryClient.invalidateQueries();
		} catch (err) {
			setImportResult(
				`Import fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
			);
		} finally {
			setImporting(false);
			input.value = "";
		}
	};

	return {
		storage,
		exporting,
		importing,
		importResult,
		handleExport,
		handleImport,
	};
};
