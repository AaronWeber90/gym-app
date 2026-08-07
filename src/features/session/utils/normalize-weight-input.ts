export const normalizeWeightInput = (value: string | number) => {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return 0;
	}

	const normalized = trimmed.replace(",", ".");
	const parsed = Number.parseFloat(normalized);
	if (!Number.isFinite(parsed)) {
		return 0;
	}

	const rounded = Math.round(parsed / 0.5) * 0.5;
	return Number(rounded.toFixed(2));
};
