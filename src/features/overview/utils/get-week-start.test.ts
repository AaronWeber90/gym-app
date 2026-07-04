import { describe, expect, it } from "vitest";
import { getWeekStart } from "./get-week-start";

describe("getWeekStart", () => {
	it("returns Monday when given a Monday", () => {
		const monday = new Date("2024-03-11"); // Monday
		const result = getWeekStart(monday);
		expect(result.toDateString()).toBe("Mon Mar 11 2024");
	});

	it("returns Monday when given a Wednesday", () => {
		const wednesday = new Date("2024-03-13"); // Wednesday
		const result = getWeekStart(wednesday);
		expect(result.toDateString()).toBe("Mon Mar 11 2024");
	});

	it("returns previous Monday when given a Sunday", () => {
		const sunday = new Date("2024-03-17"); // Sunday
		const result = getWeekStart(sunday);
		expect(result.toDateString()).toBe("Mon Mar 11 2024");
	});

	it("returns Monday when given a Saturday", () => {
		const saturday = new Date("2024-03-16"); // Saturday
		const result = getWeekStart(saturday);
		expect(result.toDateString()).toBe("Mon Mar 11 2024");
	});
});
