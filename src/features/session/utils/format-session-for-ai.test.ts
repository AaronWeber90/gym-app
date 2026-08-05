import { describe, expect, it } from "vitest";
import { formatSessionForAi } from "./format-session-for-ai";

describe("formatSessionForAi", () => {
	it("formats a compact multiline summary", () => {
		const result = formatSessionForAi(
			{
				name: "Push Day",
				date: "2026-08-05T12:00:00.000Z",
			},
			[
				{
					name: "Bankdrücken",
					sets: [
						{ weight: 80, reps: 8 },
						{ weight: 82.5, reps: 6 },
					],
				},
				{
					name: "",
					sets: [{ weight: 20, reps: 12 }],
				},
			],
		);

		expect(result).toBe(
			"Push Day - 05.08.2026\nBankdrücken: 80kgx8, 82.5kgx6\nÜbung 2: 20kgx12",
		);
	});

	it("prints fallback line when there are no exercises", () => {
		const result = formatSessionForAi(
			{
				name: "",
				date: "2026-01-10T12:00:00.000Z",
			},
			[],
		);

		expect(result).toBe("Session - 10.01.2026\nKeine Übungen");
	});
});
