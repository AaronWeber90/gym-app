import { useQueryClient } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import {
	exportAllData,
	importAllData,
} from "../features/opfs-storage/export-import";
import { Button } from "../ui/button";

export default function Settings() {
	const queryClient = useQueryClient();
	const [exporting, setExporting] = createSignal(false);
	const [importing, setImporting] = createSignal(false);
	const [importResult, setImportResult] = createSignal<string | null>(null);

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

	return (
		<div class="flex flex-col gap-4">
			<h1 class="text-2xl font-bold">Settings</h1>
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body">
					<div class="flex justify-between items-center">
						<span class="text-base-content/60">Version</span>
						<span class="font-mono text-sm">{__APP_VERSION__}</span>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 shadow-sm">
				<div class="card-body gap-4">
					<h2 class="card-title text-lg">Daten Export / Import</h2>
					<p class="text-sm text-base-content/60">
						Exportiere alle Daten als JSON-Datei und importiere sie in einem
						anderen Browser.
					</p>
					<Button
						variant="primary"
						onClick={handleExport}
						disabled={exporting()}
					>
						{exporting() ? "Exportiere…" : "Exportieren"}
					</Button>
					<label class="form-control w-full">
						<span class="label label-text">Backup-Datei auswählen</span>
						<input
							type="file"
							accept=".json"
							class="file-input"
							disabled={importing()}
							onChange={handleImport}
						/>
					</label>
					{importResult() && <p class="text-sm mt-1">{importResult()}</p>}
				</div>
			</div>
		</div>
	);
}
