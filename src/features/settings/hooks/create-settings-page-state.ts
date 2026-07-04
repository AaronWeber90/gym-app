import { useQueryClient } from "@tanstack/solid-query";
import { createResource, createSignal } from "solid-js";
import { exportAllData, importAllData } from "../../opfs-storage/utils";
import { fetchStorageUsage } from "../utils/fetch-storage-usage";

export const createSettingsPageState = () => {
	const queryClient = useQueryClient();
	const [exporting, setExporting] = createSignal(false);
	const [importing, setImporting] = createSignal(false);
	const [importResult, setImportResult] = createSignal<string | null>(null);
	const [storage] = createResource(fetchStorageUsage);

	const handleExport = async () => {
		setExporting(true);
		try {
			await exportAllData();
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
			const count = await importAllData(file);
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
