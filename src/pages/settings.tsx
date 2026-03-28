export default function Settings() {
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
		</div>
	);
}
