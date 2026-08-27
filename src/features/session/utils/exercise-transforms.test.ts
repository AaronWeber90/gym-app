import { describe, expect, it } from "vitest";
import { appendSet, mapSessionExercises } from "./exercise-transforms";

describe("mapSessionExercises", () => {
	it("preserves an optional rpe value on load", () => {
		const result = mapSessionExercises([
			{ name: "Bench", sets: [{ weight: 80, reps: 8, rpe: 9 }] },
		]);

		expect(result[0].sets[0]).toEqual({ weight: 80, reps: 8, rpe: 9 });
	});

	it("omits rpe when it is not set", () => {
		const result = mapSessionExercises([
			{ name: "Bench", sets: [{ weight: 80, reps: 8 }] },
		]);

		expect(result[0].sets[0]).toEqual({ weight: 80, reps: 8 });
		expect("rpe" in result[0].sets[0]).toBe(false);
	});
});

describe("appendSet", () => {
	it("carries over weight and reps but not rpe", () => {
		const result = appendSet(
			[{ name: "Bench", sets: [{ weight: 80, reps: 8, rpe: 9 }] }],
			0,
		);

		expect(result[0].sets).toHaveLength(2);
		expect(result[0].sets[1]).toEqual({ weight: 80, reps: 8 });
	});
});
