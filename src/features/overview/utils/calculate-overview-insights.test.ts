import { describe, expect, it } from "vitest";
import {
	calculatePersonalRecords,
	calculateWeeklyInsights,
	type OverviewSession,
} from "./calculate-overview-insights";

const sessions: OverviewSession[] = [
	{
		workoutId: "w1",
		workoutName: "Push",
		sessionId: "s1",
		date: "2026-06-01T08:00:00.000Z",
		exercises: [
			{
				name: "Bankdruecken",
				sets: [
					{ weight: 80, reps: 5 },
					{ weight: 82.5, reps: 4 },
				],
			},
		],
	},
	{
		workoutId: "w2",
		workoutName: "Pull",
		sessionId: "s2",
		date: "2026-06-03T08:00:00.000Z",
		exercises: [
			{
				name: "Kreuzheben",
				sets: [{ weight: 140, reps: 3 }],
			},
		],
	},
	{
		workoutId: "w1",
		workoutName: "Push",
		sessionId: "s3",
		date: "2026-05-25T08:00:00.000Z",
		exercises: [
			{
				name: "Bankdruecken",
				sets: [{ weight: 80, reps: 6 }],
			},
		],
	},
];

describe("calculateWeeklyInsights", () => {
	it("computes sessions, active days, volume and average sets in range", () => {
		const result = calculateWeeklyInsights(
			sessions,
			new Date("2026-06-01T00:00:00.000Z"),
			new Date("2026-06-07T00:00:00.000Z"),
		);

		expect(result.totalSessions).toBe(2);
		expect(result.activeDays).toBe(2);
		expect(result.totalVolume).toBe(1150);
		expect(result.averageSetsPerSession).toBe(1.5);
	});

	it("returns zeros for empty date range", () => {
		const result = calculateWeeklyInsights(
			sessions,
			new Date("2026-06-10T00:00:00.000Z"),
			new Date("2026-06-12T00:00:00.000Z"),
		);

		expect(result).toEqual({
			totalSessions: 0,
			activeDays: 0,
			totalVolume: 0,
			averageSetsPerSession: 0,
		});
	});
});

describe("calculatePersonalRecords", () => {
	it("keeps one best set per exercise and sorts descending", () => {
		const result = calculatePersonalRecords(sessions, 10);

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			exerciseName: "Kreuzheben",
			weight: 140,
			reps: 3,
			sessionId: "s2",
		});
		expect(result[1]).toMatchObject({
			exerciseName: "Bankdruecken",
			weight: 82.5,
			reps: 4,
			sessionId: "s1",
		});
	});

	it("applies limit", () => {
		const result = calculatePersonalRecords(sessions, 1);
		expect(result).toHaveLength(1);
		expect(result[0].exerciseName).toBe("Kreuzheben");
	});
});
