import { describe, expect, it } from "vitest";
import { formatWeekRange } from "./format-week-range";
import type { WeekDay } from "./types";

function makeWeekDays(startIso: string): WeekDay[] {
	const start = new Date(startIso);
	return Array.from({ length: 7 }, (_, i) => {
		const date = new Date(start);
		date.setDate(start.getDate() + i);
		return { date, dayName: "", workouts: [] };
	});
}

describe("formatWeekRange", () => {
	it("returns empty string for empty array", () => {
		expect(formatWeekRange([])).toBe("");
	});

	it("formats range within the same month", () => {
		const days = makeWeekDays("2024-03-11");
		expect(formatWeekRange(days)).toBe("11. - 17. März 2024");
	});

	it("formats range within the same month near month end", () => {
		const days = makeWeekDays("2024-03-25");
		expect(formatWeekRange(days)).toBe("25. - 31. März 2024");
	});

	it("formats range spanning month boundary", () => {
		const days = makeWeekDays("2024-04-29");
		expect(formatWeekRange(days)).toBe("29. April - 5. Mai 2024");
	});
});
