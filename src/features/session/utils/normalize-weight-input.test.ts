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

	it("keeps rounding training weights to 0.5 steps by default", () => {
		expect(normalizeWeightInput("82,1")).toBe(82);
		expect(normalizeWeightInput("79.9")).toBe(80);
	});

	it("rounds body weights to 0.1 steps when requested", () => {
		expect(normalizeWeightInput("82,1", 0.1)).toBe(82.1);
		expect(normalizeWeightInput("79.9", 0.1)).toBe(79.9);
		expect(normalizeWeightInput("82,14", 0.1)).toBe(82.1);
		expect(normalizeWeightInput("82.16", 0.1)).toBe(82.2);
	});
});
