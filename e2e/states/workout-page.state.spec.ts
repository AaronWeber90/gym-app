import { expect, test } from "@playwright/test";

test("workout page state exposes key accessible elements", async ({ page }) => {
	const workoutId = "b8ce5bf7-0c0b-4288-8ffd-f39f25df81ae";
	const workoutName = "Push Day";

	// Seed deterministic workout data so this state test does not depend on prior runs.
	await page.goto("/#/workouts");
	await page.evaluate(
		async ({ id, name }) => {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: true,
			});
			const file = await workoutsDir.getFileHandle(`${id}.json`, {
				create: true,
			});
			const writable = await file.createWritable();

			await writable.write(
				JSON.stringify(
					{
						id,
						name,
						created_at: new Date().toISOString(),
						exercises: [],
					},
					null,
					2,
				),
			);
			await writable.close();
		},
		{ id: workoutId, name: workoutName },
	);

	await page.goto(`/#/workouts/${workoutId}`);

	await expect(
		page.getByRole("heading", { level: 1, name: workoutName }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Trainingseinheit hinzufügen" }),
	).toBeVisible();
});
