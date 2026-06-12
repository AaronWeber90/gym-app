import { expect, test } from "@playwright/test";

test("settings page state exposes key accessible information", async ({
	page,
}) => {
	await page.goto("/#/settings");

	await expect(
		page.getByRole("heading", { level: 1, name: "Settings" }),
	).toBeVisible();

	const versionRow = page
		.locator("div.flex.justify-between.items-center")
		.filter({ hasText: "Version" })
		.first();

	await expect(versionRow.getByText("Version")).toBeVisible();
	await expect(versionRow.locator("span").nth(1)).toHaveText(/\S+/);
});
