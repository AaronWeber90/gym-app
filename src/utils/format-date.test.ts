import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
	it("formats a date string with default options", () => {
		expect(formatDate("2024-03-15")).toBe("15.3.2024");
	});

	it("formats with custom options", () => {
		expect(formatDate("2024-03-15", { month: "long", year: "numeric" })).toBe(
			"März 2024",
		);
	});

	it("formats with day, month and year long form", () => {
		expect(
			formatDate("2024-03-15", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}),
		).toBe("15. März 2024");
	});
});
