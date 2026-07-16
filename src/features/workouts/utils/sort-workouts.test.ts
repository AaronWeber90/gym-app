import { describe, expect, it } from "vitest";
import type { Workout } from "../../../api/types";
import { sortWorkouts } from "./sort-workouts";

const createWorkout = (overrides: Partial<Workout> = {}): Workout => ({
	id: "id",
	name: "Workout",
	created_at: "2024-01-01T00:00:00.000Z",
	lastTrainedAt: null,
	sessions: [],
	...overrides,
});

describe("sortWorkouts", () => {
	it("puts workouts with the oldest last trained date first", () => {
		const workouts = [
			createWorkout({
				id: "1",
				name: "Alpha",
				lastTrainedAt: "2024-06-01T00:00:00.000Z",
			}),
			createWorkout({
				id: "2",
				name: "Beta",
				lastTrainedAt: "2024-02-01T00:00:00.000Z",
			}),
			createWorkout({ id: "3", name: "Gamma", lastTrainedAt: null }),
		];

		const sorted = sortWorkouts(workouts, "oldest");

		expect(sorted.map((item) => item.id)).toEqual(["2", "1", "3"]);
	});

	it("keeps alphabetical sorting for name-based modes", () => {
		const workouts = [
			createWorkout({ id: "1", name: "Zeta" }),
			createWorkout({ id: "2", name: "Alpha" }),
		];

		const sorted = sortWorkouts(workouts, "asc");

		expect(sorted.map((item) => item.id)).toEqual(["2", "1"]);
	});
});
