import { expect, test } from "@playwright/test";

test("creates lower-body workout, fills realistic session data, and persists via OPFS", async ({
	page,
}) => {
	const workoutName = "lower-body";

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

	await page.getByRole("button", { name: "+ Übung hinzufügen" }).click();
	await page.getByRole("button", { name: "+ Übung hinzufügen" }).click();

	const exerciseData = [
		{
			name: "Kniebeuge",
			sets: [
				{ weight: 80, reps: 8 },
				{ weight: 85, reps: 6 },
				{ weight: 90, reps: 5 },
			],
		},
		{
			name: "Romanian Deadlift",
			sets: [
				{ weight: 70, reps: 10 },
				{ weight: 75, reps: 8 },
			],
		},
		{
			name: "Bulgarian Split Squat",
			sets: [
				{ weight: 20, reps: 12 },
				{ weight: 22, reps: 10 },
			],
		},
	];

	for (const [exerciseIndex, exercise] of exerciseData.entries()) {
		const block = page.locator("div.border-l-4").nth(exerciseIndex);
		await block.getByPlaceholder("Übungsname").fill(exercise.name);

		for (let i = 1; i < exercise.sets.length; i++) {
			await block.getByRole("button", { name: "+ Satz" }).click();
		}

		for (const [setIndex, set] of exercise.sets.entries()) {
			const setRows = block.locator("tbody tr");
			const setRow = setRows.nth(setIndex);
			const weightInput = setRow.locator("input[type='text']");
			const repsInput = setRow.locator("input[type='number']");

			await weightInput.fill(String(set.weight).replace(".", ","));
			await repsInput.fill(String(set.reps));
		}
	}

	// Session persistence is debounced in-app, so wait before reloading.
	await page.waitForTimeout(800);

	await page.reload();
	await expect(page).toHaveURL(/#\/workouts\/[0-9a-f-]+\/[0-9a-f-]+$/);
	await expect(
		page.getByRole("button", { name: "+ Übung hinzufügen" }),
	).toBeVisible();

	const exerciseNameInputs = page.locator("input[placeholder='Übungsname']");
	await expect(exerciseNameInputs.nth(0)).toHaveValue("Kniebeuge");
	await expect(exerciseNameInputs.nth(1)).toHaveValue("Romanian Deadlift");
	await expect(exerciseNameInputs.nth(2)).toHaveValue("Bulgarian Split Squat");

	const firstExercise = page.locator("div.border-l-4").first();
	const firstExerciseRows = firstExercise.locator("tbody tr");
	await expect(firstExerciseRows).toHaveCount(3);
	await expect(
		firstExerciseRows.nth(0).locator("input[type='text']"),
	).toHaveValue("80");
	await expect(
		firstExerciseRows.nth(0).locator("input[type='number']"),
	).toHaveValue("8");

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
