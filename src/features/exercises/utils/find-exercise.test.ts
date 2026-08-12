import { describe, expect, it } from "vitest";
import {
	EXERCISE_CATALOG,
	findExercise,
	getExerciseSuggestions,
} from "./index";

describe("findExercise", () => {
	it.each([
		["exact name", "Bankdrücken", "Bankdrücken"],
		["case-insensitive", "BANKDRÜCKEN", "Bankdrücken"],
		["extra whitespace", "  Bankdrücken  ", "Bankdrücken"],
		["alias", "Barbell Bench Press", "Bankdrücken"],
		["alias case-insensitive", "barbell bench press", "Bankdrücken"],
	])("finds exercise by %s", (_label, input, expectedName) => {
		const result = findExercise(input);
		expect(result).toBeDefined();
		expect(result?.name).toBe(expectedName);
	});

	it.each([
		["unknown exercise", "Unbekannte Übung"],
		["partial match", "Bank"],
	])("returns undefined for %s", (_label, input) => {
		expect(findExercise(input)).toBeUndefined();
	});
});

describe("getExerciseSuggestions", () => {
	it("returns list of exercise names", () => {
		const suggestions = getExerciseSuggestions();
		expect(suggestions.length).toBeGreaterThan(0);
		expect(suggestions).toEqual(EXERCISE_CATALOG.map((ex) => ex.name));
	});

	it("includes common exercises", () => {
		const suggestions = getExerciseSuggestions();
		expect(suggestions).toContain("Bankdrücken");
		expect(suggestions).toContain("Kniebeuge");
		expect(suggestions).toContain("Kreuzheben");
	});
});
