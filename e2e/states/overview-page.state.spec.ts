import { expect, test } from "@playwright/test";

test("overview page state exposes key accessible elements", async ({
	page,
}) => {
	await page.goto("/#/overview");

	await expect(
		page.getByRole("heading", { level: 1, name: "Übersicht" }),
	).toBeVisible();

	await expect(page.getByRole("button", { name: "Heute" })).toBeVisible();
});
