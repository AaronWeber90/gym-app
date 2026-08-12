import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "./exercise-catalog";

describe("exercise-catalog", () => {
	it("has no duplicate names", () => {
		const names = EXERCISE_CATALOG.map((ex) => ex.name.toLowerCase());
		const unique = new Set(names);
		expect(unique.size).toBe(names.length);
	});

	it("has no duplicate aliases", () => {
		const aliases = EXERCISE_CATALOG.flatMap(
			(ex) => ex.aliases?.map((a) => a.toLowerCase()) ?? [],
		);
		const unique = new Set(aliases);
		expect(unique.size).toBe(aliases.length);
	});

	it("all exercises have at least one muscle group", () => {
		for (const exercise of EXERCISE_CATALOG) {
			expect(exercise.muscleGroups.length).toBeGreaterThan(0);
		}
	});

	it("all muscle groups are valid", () => {
		const validGroups = new Set([
			"chest",
			"back",
			"shoulders",
			"traps",
			"biceps",
			"triceps",
			"forearms",
			"quadriceps",
			"hamstrings",
			"glutes",
			"calves",
			"core",
		]);

		for (const exercise of EXERCISE_CATALOG) {
			for (const group of exercise.muscleGroups) {
				expect(validGroups.has(group)).toBe(true);
			}
		}
	});
});
