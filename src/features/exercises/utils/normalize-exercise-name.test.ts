import { describe, expect, it } from "vitest";
import { normalizeExerciseName } from "./normalize-exercise-name";

describe("normalizeExerciseName", () => {
	it("trims whitespace", () => {
		expect(normalizeExerciseName("  Bankdrücken  ")).toBe("bankdrücken");
	});

	it("converts to lowercase", () => {
		expect(normalizeExerciseName("Bankdrücken")).toBe("bankdrücken");
		expect(normalizeExerciseName("BANKDRÜCKEN")).toBe("bankdrücken");
	});

	it("collapses multiple spaces", () => {
		expect(normalizeExerciseName("Kurzhantel  Bankdrücken")).toBe(
			"kurzhantel bankdrücken",
		);
	});

	it("handles combined whitespace", () => {
		expect(normalizeExerciseName("  Kniebeuge  \n  mit  Pause  ")).toBe(
			"kniebeuge mit pause",
		);
	});
});
