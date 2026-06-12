import { expect, test } from "@playwright/test";

test("workout session detail page state exposes key accessible elements", async ({
	page,
}) => {
	const workoutId = "74c161db-f0c8-477d-b106-5b3855de8b2f";
	const sessionId = "7dc75538-d95b-41fa-9dec-9f0599a09e3e";
	const sessionDate = "2026-06-12T10:30:00.000Z";

	// Seed deterministic workout/session data so this state test is isolated.
	await page.goto("/#/workouts");
	await page.evaluate(
		async ({ id, sessionId, date }) => {
			const root = await navigator.storage.getDirectory();
			const workoutsDir = await root.getDirectoryHandle("workouts", {
				create: true,
			});

			const workoutFile = await workoutsDir.getFileHandle(`${id}.json`, {
				create: true,
			});
			const workoutWritable = await workoutFile.createWritable();
			await workoutWritable.write(
				JSON.stringify(
					{
						id,
						name: "Push Day",
						created_at: date,
						lastTrainedAt: date,
						sessions: [{ id: sessionId, date }],
					},
					null,
					2,
				),
			);
			await workoutWritable.close();

			const sessionDir = await workoutsDir.getDirectoryHandle(id, {
				create: true,
			});
			const sessionFile = await sessionDir.getFileHandle(`${sessionId}.json`, {
				create: true,
			});
			const sessionWritable = await sessionFile.createWritable();
			await sessionWritable.write(
				JSON.stringify(
					{
						id: sessionId,
						parentId: id,
						name: "Push Day",
						date,
						created_at: date,
						exercises: [
							{
								name: "Bankdruecken",
								sets: [{ weight: 80, reps: 8 }],
							},
						],
					},
					null,
					2,
				),
			);
			await sessionWritable.close();
		},
		{ id: workoutId, sessionId, date: sessionDate },
	);

	await page.goto(`/gym-app/#/workouts/${workoutId}/${sessionId}`);

	await expect(
		page.getByRole("heading", { level: 1, name: "12.06.2026" }),
	).toBeVisible();
	await expect(page.getByRole("button", { name: /Session/i })).toBeVisible();
	await expect(page.getByRole("button", { name: /hinzuf/i })).toBeVisible();
});
