import { describe, expect, it } from "vitest";
import type { Workout } from "../../../api/types";
import { buildWeekDays } from "./build-week-days";

const weekStart = new Date("2024-03-11"); // Monday

const workout: Workout = {
	id: "w1",
	name: "Push",
	created_at: "2024-01-01",
	lastTrainedAt: "2024-03-13",
	sessions: [
		{ id: "s1", date: "2024-03-13T10:00:00Z" }, // Wednesday
		{ id: "s2", date: "2024-03-15T08:00:00Z" }, // Friday
	],
};

describe("buildWeekDays", () => {
	it("returns 7 days starting from weekStart", () => {
		const days = buildWeekDays(weekStart, []);
		expect(days).toHaveLength(7);
		expect(days[0].date.toDateString()).toBe("Mon Mar 11 2024");
		expect(days[6].date.toDateString()).toBe("Sun Mar 17 2024");
	});

	it("assigns day names in order Mon-Sun", () => {
		const days = buildWeekDays(weekStart, []);
		expect(days[0].dayName).toBe("Montag");
		expect(days[6].dayName).toBe("Sonntag");
	});

	it("places sessions on the correct day", () => {
		const days = buildWeekDays(weekStart, [workout]);
		const wednesday = days[2]; // index 2 = Wednesday
		const friday = days[4]; // index 4 = Friday
		expect(wednesday.workouts).toHaveLength(1);
		expect(wednesday.workouts[0].sessionId).toBe("s1");
		expect(friday.workouts).toHaveLength(1);
		expect(friday.workouts[0].sessionId).toBe("s2");
	});

	it("returns empty workouts for days without sessions", () => {
		const days = buildWeekDays(weekStart, [workout]);
		expect(days[0].workouts).toHaveLength(0); // Monday
		expect(days[1].workouts).toHaveLength(0); // Tuesday
	});

	it("sorts multiple sessions on same day by descending timestamp", () => {
		const w: Workout = {
			id: "w1",
			name: "Push",
			created_at: "2024-01-01",
			lastTrainedAt: null,
			sessions: [
				{ id: "early", date: "2024-03-11T06:00:00Z" },
				{ id: "late", date: "2024-03-11T18:00:00Z" },
			],
		};
		const days = buildWeekDays(weekStart, [w]);
		expect(days[0].workouts[0].sessionId).toBe("late");
		expect(days[0].workouts[1].sessionId).toBe("early");
	});
});
