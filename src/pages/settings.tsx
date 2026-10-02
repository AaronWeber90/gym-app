import { Show } from "solid-js";
import { createSettingsPageState } from "../features/settings/hooks/create-settings-page-state";
import { formatBytes } from "../features/settings/utils/format-bytes";
import { Header } from "../features/workouts/components/header";
import { Button } from "../ui/button";
import { GithubIcon } from "../ui/icons/github";
import { Section } from "../ui/section";

const PERCENT = 100;

export function Settings() {
	const {
		storage,
		exporting,
		importing,
		importResult,
		handleExport,
		handleImport,
	} = createSettingsPageState();

	return (
		<div class="flex flex-col gap-4">
			<Header title="Settings" />
			<Section>
				<div class="flex justify-between items-center">
					<span class="text-base-content/60">Version</span>
					<span class="font-mono text-sm">{__APP_VERSION__}</span>
				</div>
			</Section>

			<Section>
				<div class="flex flex-col gap-2">
					<h2 class="card-title text-lg">Speicher</h2>
					<Show when={storage()}>
						{(s) => (
							<>
								<div class="flex justify-between items-center">
									<span class="text-base-content/60">Belegt</span>
									<span class="font-mono text-sm">
										{formatBytes(s().usage)} (
										{((s().usage / s().quota) * PERCENT).toFixed(2)}%)
									</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-base-content/60">Verfügbar</span>
									<span class="font-mono text-sm">
										{formatBytes(s().quota)}
									</span>
								</div>
								<progress
									class="progress progress-primary w-full"
									value={s().usage}
									max={s().quota}
								/>
							</>
						)}
					</Show>
				</div>
			</Section>

			<Section>
				<div class="flex flex-col gap-4">
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
			</Section>

			<Section>
				<div class="flex flex-col gap-2">
					<h2 class="card-title text-lg">Feedback</h2>
					<p class="text-sm text-base-content/60">
						Zum Erstellen eines Issues musst du bei GitHub angemeldet sein und
						Zugriff auf das private Repository haben.
					</p>
					<a
						class="link link-primary inline-flex items-center gap-2"
						href="https://github.com/AaronWeber90/gym-app/issues/new"
						target="_blank"
						rel="noopener noreferrer"
					>
						<GithubIcon />
						Fehler oder Feedback melden
					</a>
				</div>
			</Section>
		</div>
	);
}
