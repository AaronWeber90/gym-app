import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("calls the function after the delay", () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced();
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(300);
		expect(fn).toHaveBeenCalledOnce();
	});

	it("resets the timer on subsequent calls", () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced();
		vi.advanceTimersByTime(200);
		debounced();
		vi.advanceTimersByTime(200);

		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledOnce();
	});

	it("passes arguments to the function", () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced("a", "b");
		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledWith("a", "b");
	});
});
