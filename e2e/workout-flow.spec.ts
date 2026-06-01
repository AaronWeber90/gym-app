import { expect, test } from "@playwright/test";

test("creates lower-back workout, creates a session, and persists via OPFS", async ({
	page,
}) => {
	const workoutName = "lower-back";

	await page.goto("/#/workouts");

	// Reset OPFS workouts directory for deterministic E2E runs.
	await page.evaluate(async () => {
		const storageWithDirectory = navigator.storage as StorageManager & {
			getDirectory: () => Promise<FileSystemDirectoryHandle>;
		};
		const root = await storageWithDirectory.getDirectory();
		let workoutsDir: FileSystemDirectoryHandle;

		try {
			workoutsDir = await root.getDirectoryHandle("workouts");
		} catch {
			return;
		}

		for await (const [name] of workoutsDir.entries()) {
			await workoutsDir.removeEntry(name, { recursive: true });
		}
	});

	await page.reload();
	await expect(page.getByText("Keine Übungen vorhanden")).toBeVisible();

	await page.locator(".fab .btn-circle.btn-primary").click();
	await expect(page.getByText("Neuer Trainingsplan")).toBeVisible();
	await page.getByPlaceholder("Workout name").fill(workoutName);
	await page.getByRole("button", { name: "Speichern" }).click();

	const workoutLink = page.locator("a[href^='#/workouts/']", {
		hasText: workoutName,
	});
	await expect(workoutLink).toBeVisible();
	await workoutLink.click();

	await expect(page).toHaveURL(/#\/workouts\/[0-9a-f-]+$/);

	await page.locator(".fab .btn-circle.btn-primary").click();
	await expect(page).toHaveURL(/#\/workouts\/[0-9a-f-]+\/[0-9a-f-]+$/);
	await expect(
		page.getByRole("button", { name: "+ Übung hinzufügen" }),
	).toBeVisible();

	await page.reload();
	await expect(page).toHaveURL(/#\/workouts\/[0-9a-f-]+\/[0-9a-f-]+$/);
	await expect(
		page.getByRole("button", { name: "+ Übung hinzufügen" }),
	).toBeVisible();

	await page.getByRole("button", { name: "Workouts" }).click();
	await expect(page).toHaveURL(/#\/workouts$/);

	await page
		.locator("a[href^='#/workouts/']", { hasText: workoutName })
		.click();
	await expect(page).toHaveURL(/#\/workouts\/[0-9a-f-]+$/);
	await expect(
		page.locator("a[href^='#/workouts/']").filter({
			hasText: /\d{2}\.\d{2}\.\d{2}/,
		}),
	).toHaveCount(1);
});
