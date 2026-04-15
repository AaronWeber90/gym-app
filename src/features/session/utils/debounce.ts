export const debounce = <T extends (...args: unknown[]) => unknown>(
	fn: T,
	ms: number,
) => {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), ms);
	};
};
