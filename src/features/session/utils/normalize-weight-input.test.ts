import { describe, expect, it } from "vitest";
import { normalizeWeightInput } from "./normalize-weight-input";

describe("normalizeWeightInput", () => {
	it("parses comma decimals and rounds to 0.5 steps", () => {
		expect(normalizeWeightInput("10,5")).toBe(10.5);
		expect(normalizeWeightInput("12,5")).toBe(12.5);
	});

	it("accepts dot decimals as well", () => {
		expect(normalizeWeightInput("10.5")).toBe(10.5);
		expect(normalizeWeightInput("12.5")).toBe(12.5);
	});

	it("returns 0 for empty input", () => {
		expect(normalizeWeightInput("")).toBe(0);
	});
});
