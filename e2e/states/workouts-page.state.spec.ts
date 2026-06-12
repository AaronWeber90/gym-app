import { expect, test } from "@playwright/test";

test("workouts page state exposes key accessible elements", async ({
	page,
}) => {
	await page.goto("/#/workouts");

	await expect(
		page.getByRole("heading", { level: 1, name: "Workouts" }),
	).toBeVisible();

	await expect(
		page.getByRole("button", { name: "Training hinzufügen" }),
	).toBeVisible();
});
