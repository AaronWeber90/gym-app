import { describe, expect, it } from "vitest";
import {
	combineDateAndTime,
	toDateInputValue,
	toTimeInputValue,
} from "./date-time-input";

describe("date-time-input", () => {
	it("converts an ISO string to local date/time input values", () => {
		const iso = new Date(2026, 8, 27, 14, 30).toISOString();
		expect(toDateInputValue(iso)).toBe("2026-09-27");
		expect(toTimeInputValue(iso)).toBe("14:30");
	});

	it("pads single-digit month, day, hour and minute", () => {
		const iso = new Date(2026, 0, 5, 9, 5).toISOString();
		expect(toDateInputValue(iso)).toBe("2026-01-05");
		expect(toTimeInputValue(iso)).toBe("09:05");
	});

	it("combines date and time inputs into a local ISO string", () => {
		const iso = combineDateAndTime("2026-09-27", "14:30");
		const result = new Date(iso);
		expect(result.getFullYear()).toBe(2026);
		expect(result.getMonth()).toBe(8);
		expect(result.getDate()).toBe(27);
		expect(result.getHours()).toBe(14);
		expect(result.getMinutes()).toBe(30);
	});
});
