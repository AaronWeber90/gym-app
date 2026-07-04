import { describe, expect, it } from "vitest";
import { isToday } from "./is-today";

describe("isToday", () => {
	it("returns true when date matches today", () => {
		const today = new Date("2024-03-15");
		expect(isToday(new Date("2024-03-15"), today)).toBe(true);
	});

	it("returns false for yesterday", () => {
		const today = new Date("2024-03-15");
		expect(isToday(new Date("2024-03-14"), today)).toBe(false);
	});

	it("returns false for tomorrow", () => {
		const today = new Date("2024-03-15");
		expect(isToday(new Date("2024-03-16"), today)).toBe(false);
	});

	it("returns false for same day in different month", () => {
		const today = new Date("2024-03-15");
		expect(isToday(new Date("2024-04-15"), today)).toBe(false);
	});

	it("returns false for same day in different year", () => {
		const today = new Date("2024-03-15");
		expect(isToday(new Date("2023-03-15"), today)).toBe(false);
	});
});
