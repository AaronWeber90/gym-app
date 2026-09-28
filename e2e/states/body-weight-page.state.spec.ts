import { expect, type Page, test } from "@playwright/test";

async function resetBodyWeightDirectory(page: Page) {
	await page.evaluate(async () => {
		const storageWithDirectory = navigator.storage as StorageManager & {
			getDirectory: () => Promise<FileSystemDirectoryHandle>;
		};
		const root = await storageWithDirectory.getDirectory();
		let bodyWeightDir: FileSystemDirectoryHandle;

		try {
			bodyWeightDir = await root.getDirectoryHandle("body-weight");
		} catch {
			return;
		}

		for await (const [name] of bodyWeightDir.entries()) {
			await bodyWeightDir.removeEntry(name, { recursive: true });
		}
	});
}

async function goToEmptyBodyWeightPage(page: Page) {
	await page.goto("/#/body-weight");
	await resetBodyWeightDirectory(page);
	await page.reload();
	await expect(page.getByText("Noch keine Einträge vorhanden")).toHaveCount(2);
}

test("body weight page shows an empty state before any entry exists", async ({
	page,
}) => {
	await goToEmptyBodyWeightPage(page);

	await expect(
		page.getByRole("heading", { level: 1, name: "Körpergewicht" }),
	).toBeVisible();
});

test("adding an entry defaults to now and shows up in the list and chart", async ({
	page,
}) => {
	await goToEmptyBodyWeightPage(page);

	await page.locator(".fab .btn-circle.btn-primary").click();
	await expect(page.getByText("Gewicht hinzufügen")).toBeVisible();

	const dateInput = page.getByLabel("Datum");
	const timeInput = page.getByLabel("Uhrzeit");
	await expect(dateInput).not.toHaveValue("");
	await expect(timeInput).not.toHaveValue("");

	await page.getByLabel("Gewicht (kg)").fill("82,5");
	await page.getByRole("button", { name: "Speichern" }).click();

	await expect(page.getByText("82.5 kg")).toBeVisible();
	await expect(
		page.locator("svg[aria-label='Gewichtsverlauf'] circle"),
	).toHaveCount(1);
});

test("editing an existing entry updates its weight", async ({ page }) => {
	await goToEmptyBodyWeightPage(page);

	await page.locator(".fab .btn-circle.btn-primary").click();
	await page.getByLabel("Gewicht (kg)").fill("80");
	await page.getByRole("button", { name: "Speichern" }).click();
	await expect(page.getByText("80 kg")).toBeVisible();

	await page.getByText("80 kg").click();
	await expect(page.getByText("Eintrag bearbeiten")).toBeVisible();
	await page.getByLabel("Gewicht (kg)").fill("79");
	await page.getByRole("button", { name: "Speichern" }).click();

	await expect(page.getByText("79 kg")).toBeVisible();
	await expect(page.getByText("80 kg")).toHaveCount(0);
});

test("deleting an entry removes it from the list and chart", async ({
	page,
}) => {
	await goToEmptyBodyWeightPage(page);

	await page.locator(".fab .btn-circle.btn-primary").click();
	await page.getByLabel("Gewicht (kg)").fill("80");
	await page.getByRole("button", { name: "Speichern" }).click();
	await expect(page.getByText("80 kg")).toBeVisible();

	await page.getByRole("button", { name: "Eintrag löschen" }).click();
	await expect(page.getByText("Eintrag löschen?")).toBeVisible();
	await page.getByRole("button", { name: "Löschen", exact: true }).click();

	await expect(page.getByText("80 kg")).toHaveCount(0);
	await expect(page.getByText("Noch keine Einträge vorhanden")).toHaveCount(2);
});
