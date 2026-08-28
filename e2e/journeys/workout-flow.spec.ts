import { expect, type Page, test } from "@playwright/test";

type ExerciseFixture = {
	name: string;
	sets: Array<{ weight: number; reps: number }>;
};

const exerciseData: ExerciseFixture[] = [
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

async function resetWorkoutsDirectory(page: Page) {
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
}

async function fillExerciseData(page: Page, exercises: ExerciseFixture[]) {
	for (const [exerciseIndex, exercise] of exercises.entries()) {
		const block = page.locator("div.border-l-4").nth(exerciseIndex);
		await block.getByPlaceholder("Übungsname").fill(exercise.name);

		for (let index = 1; index < exercise.sets.length; index++) {
			await block.getByRole("button", { name: "+ Satz" }).click();
		}

		for (const [setIndex, set] of exercise.sets.entries()) {
			const setRows = block.locator("tbody tr");
			const setRow = setRows.nth(setIndex);
			const weightInput = setRow.locator("input[type='text']");
			const repsInput = setRow.getByRole("spinbutton").first();

			await weightInput.fill(String(set.weight).replace(".", ","));
			await repsInput.fill(String(set.reps));
		}
	}
}

async function createWorkout(page: Page, workoutName: string) {
	await page.goto("/#/workouts");
	await resetWorkoutsDirectory(page);
	await page.reload();
	await expect(page.getByText("Keine Übungen vorhanden")).toBeVisible();

	await page.locator(".fab .btn-circle.btn-primary").click();
	await expect(page.getByText("Neuer Trainingsplan")).toBeVisible();
	await page.getByPlaceholder("Workout name").fill(workoutName);
	await page.getByRole("button", { name: "Speichern" }).click();
}

async function openWorkoutSession(page: Page, workoutName: string) {
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
}

async function assertPersistedSession(page: Page) {
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
		firstExerciseRows.nth(0).getByRole("spinbutton").first(),
	).toHaveValue("8");
}

test("creates lower-body workout, fills realistic session data, and persists via OPFS", async ({
	page,
}) => {
	const workoutName = "lower-body";

	await createWorkout(page, workoutName);
	await openWorkoutSession(page, workoutName);
	await page.getByRole("button", { name: "+ Übung hinzufügen" }).click();
	await page.getByRole("button", { name: "+ Übung hinzufügen" }).click();
	await fillExerciseData(page, exerciseData);
	await assertPersistedSession(page);

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
