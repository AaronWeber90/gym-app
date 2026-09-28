import { describe, expect, it } from "vitest";
import { computeChartPoints } from "./compute-chart-points";

const entry = (weight: number, date: string) => ({
	id: date,
	weight,
	date,
	created_at: date,
});

describe("computeChartPoints - positioning", () => {
	it("returns an empty layout for no entries", () => {
		expect(computeChartPoints([], { width: 100, height: 50 })).toEqual({
			points: [],
			polyline: "",
			minWeight: 0,
			maxWeight: 0,
			yTicks: [],
			xTicks: [],
			plotLeft: 0,
			plotRight: 0,
			plotTop: 0,
			plotBottom: 0,
		});
	});

	it("centers a single entry horizontally and vertically", () => {
		const result = computeChartPoints([entry(80, "2026-01-01T00:00:00.000Z")], {
			width: 100,
			height: 50,
			paddingLeft: 0,
			paddingRight: 0,
			paddingTop: 0,
			paddingBottom: 0,
		});

		expect(result.points).toHaveLength(1);
		expect(result.points[0].x).toBe(50);
		expect(result.points[0].y).toBe(25);
	});

	it("spaces points proportionally to elapsed time, not index", () => {
		const result = computeChartPoints(
			[
				entry(80, "2026-01-01T00:00:00.000Z"),
				entry(80, "2026-01-02T00:00:00.000Z"),
				entry(80, "2026-01-10T00:00:00.000Z"),
			],
			{
				width: 100,
				height: 50,
				paddingLeft: 0,
				paddingRight: 0,
				paddingTop: 0,
				paddingBottom: 0,
			},
		);

		const [first, second, third] = result.points;
		expect(first.x).toBe(0);
		expect(third.x).toBe(100);
		// day 2 of a 9-day range should land close to the start, not at the midpoint
		expect(second.x).toBeCloseTo((1 / 9) * 100);
	});
});

describe("computeChartPoints - weight range", () => {
	it("maps min/max weight to the bottom/top of the chart", () => {
		const result = computeChartPoints(
			[
				entry(70, "2026-01-01T00:00:00.000Z"),
				entry(90, "2026-01-02T00:00:00.000Z"),
			],
			{
				width: 100,
				height: 50,
				paddingLeft: 0,
				paddingRight: 0,
				paddingTop: 0,
				paddingBottom: 0,
			},
		);

		expect(result.points[0].y).toBe(50);
		expect(result.points[1].y).toBe(0);
		expect(result.minWeight).toBe(70);
		expect(result.maxWeight).toBe(90);
	});

	it("avoids a zero-height range when all weights are identical", () => {
		const result = computeChartPoints(
			[
				entry(80, "2026-01-01T00:00:00.000Z"),
				entry(80, "2026-01-02T00:00:00.000Z"),
			],
			{ width: 100, height: 50 },
		);

		expect(result.minWeight).toBe(79);
		expect(result.maxWeight).toBe(81);
	});
});

describe("computeChartPoints - axis ticks", () => {
	it("places min/mid/max weight y-ticks at the matching pixel rows", () => {
		const result = computeChartPoints(
			[
				entry(70, "2026-01-01T00:00:00.000Z"),
				entry(90, "2026-01-02T00:00:00.000Z"),
			],
			{
				width: 100,
				height: 50,
				paddingLeft: 0,
				paddingRight: 0,
				paddingTop: 0,
				paddingBottom: 0,
			},
		);

		expect(result.yTicks).toEqual([
			{ value: 70, y: 50 },
			{ value: 80, y: 25 },
			{ value: 90, y: 0 },
		]);
	});

	it("labels the time axis with only first/middle/last entries", () => {
		const result = computeChartPoints(
			[
				entry(70, "2026-01-01T00:00:00.000Z"),
				entry(75, "2026-01-04T00:00:00.000Z"),
				entry(72, "2026-01-07T00:00:00.000Z"),
				entry(68, "2026-01-10T00:00:00.000Z"),
				entry(65, "2026-01-13T00:00:00.000Z"),
			],
			{
				width: 100,
				height: 50,
				paddingLeft: 0,
				paddingRight: 0,
				paddingTop: 0,
				paddingBottom: 0,
			},
		);

		expect(result.xTicks.map((tick) => tick.date)).toEqual([
			"2026-01-01T00:00:00.000Z",
			"2026-01-07T00:00:00.000Z",
			"2026-01-13T00:00:00.000Z",
		]);
	});
});

describe("computeChartPoints - axis tick spacing", () => {
	it("drops a middle tick that would overlap a nearby neighbour", () => {
		const result = computeChartPoints(
			[
				entry(70, "2026-01-01T00:00:00.000Z"),
				entry(69, "2026-01-02T00:00:00.000Z"),
				entry(68, "2026-01-30T00:00:00.000Z"),
			],
			{
				width: 100,
				height: 50,
				paddingLeft: 0,
				paddingRight: 0,
				paddingTop: 0,
				paddingBottom: 0,
				minTickSpacing: 40,
			},
		);

		expect(result.xTicks.map((tick) => tick.date)).toEqual([
			"2026-01-01T00:00:00.000Z",
			"2026-01-30T00:00:00.000Z",
		]);
	});

	it("drops a tick crowded near the end to keep first and last legible", () => {
		const result = computeChartPoints(
			[
				entry(70, "2026-01-01T00:00:00.000Z"),
				entry(69, "2026-01-29T00:00:00.000Z"),
				entry(68, "2026-01-30T00:00:00.000Z"),
			],
			{
				width: 100,
				height: 50,
				paddingLeft: 0,
				paddingRight: 0,
				paddingTop: 0,
				paddingBottom: 0,
				minTickSpacing: 40,
			},
		);

		expect(result.xTicks.map((tick) => tick.date)).toEqual([
			"2026-01-01T00:00:00.000Z",
			"2026-01-30T00:00:00.000Z",
		]);
	});
});
