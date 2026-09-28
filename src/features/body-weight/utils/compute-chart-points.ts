import type { BodyWeightEntry } from "@api";

export type ChartPoint = {
	x: number;
	y: number;
	entry: BodyWeightEntry;
};

export type YTick = { value: number; y: number };
export type XTick = { date: string; x: number };

export type ChartLayout = {
	points: ChartPoint[];
	polyline: string;
	minWeight: number;
	maxWeight: number;
	yTicks: YTick[];
	xTicks: XTick[];
	plotLeft: number;
	plotRight: number;
	plotTop: number;
	plotBottom: number;
};

type ComputeChartPointsOptions = {
	width: number;
	height: number;
	paddingLeft?: number;
	paddingRight?: number;
	paddingTop?: number;
	paddingBottom?: number;
	// minimum pixel gap between adjacent time-axis labels before one is dropped
	minTickSpacing?: number;
};

const EMPTY_LAYOUT: ChartLayout = {
	points: [],
	polyline: "",
	minWeight: 0,
	maxWeight: 0,
	yTicks: [],
	xTicks: [],
	plotLeft: 0,
	plotRight: 0,
	plotTop: 0,
	plotBottom: 0,
};

const entriesRange = (count: number): number[] =>
	Array.from({ length: count }, (_, index) => index);

// picks up to 3 entry indices (first/middle/last) to label the time axis without crowding it
const pickTickIndices = (count: number): number[] => {
	if (count <= 2) return entriesRange(count);
	return [...new Set([0, Math.floor((count - 1) / 2), count - 1])];
};

// drops ticks that would render closer together than minSpacing, always keeping the last one
const withMinSpacing = (ticks: XTick[], minSpacing: number): XTick[] => {
	if (ticks.length <= 1) return ticks;
	const kept: XTick[] = [ticks[0]];
	ticks.slice(1).forEach((candidate, i) => {
		const isLast = i === ticks.length - 2;
		const gap = candidate.x - kept[kept.length - 1].x;
		if (gap >= minSpacing) {
			kept.push(candidate);
			return;
		}
		if (!isLast) return;
		while (
			kept.length > 0 &&
			candidate.x - kept[kept.length - 1].x < minSpacing
		) {
			kept.pop();
		}
		kept.push(candidate);
	});
	return kept;
};

// avoid a zero-height range when every entry has the same weight
const buildWeightRange = (weights: number[]) => {
	const rawMin = Math.min(...weights);
	const rawMax = Math.max(...weights);
	return rawMin === rawMax
		? { minWeight: rawMin - 1, maxWeight: rawMax + 1 }
		: { minWeight: rawMin, maxWeight: rawMax };
};

type PlotBounds = {
	plotLeft: number;
	plotRight: number;
	plotTop: number;
	plotBottom: number;
};

const buildScales = (
	bounds: PlotBounds,
	timeRange: { minTime: number; maxTime: number },
	weightRange: { minWeight: number; maxWeight: number },
) => {
	const { plotLeft, plotRight, plotTop, plotBottom } = bounds;
	const { minTime, maxTime } = timeRange;
	const { minWeight, maxWeight } = weightRange;
	const span = maxTime - minTime;

	const toX = (time: number) => {
		const ratio = span === 0 ? 0.5 : (time - minTime) / span;
		return plotLeft + ratio * (plotRight - plotLeft);
	};
	const toY = (weight: number) => {
		const ratio = (weight - minWeight) / (maxWeight - minWeight);
		return plotTop + (1 - ratio) * (plotBottom - plotTop);
	};
	return { toX, toY };
};

// entries must be sorted ascending by date; x is time-proportional so gaps between weigh-ins stay visible
export const computeChartPoints = (
	entries: BodyWeightEntry[],
	options: ComputeChartPointsOptions,
): ChartLayout => {
	const {
		width,
		height,
		paddingLeft = 24,
		paddingRight = 24,
		paddingTop = 16,
		paddingBottom = 16,
		minTickSpacing = 40,
	} = options;

	if (entries.length === 0) return EMPTY_LAYOUT;

	const { minWeight, maxWeight } = buildWeightRange(
		entries.map((entry) => entry.weight),
	);
	const times = entries.map((entry) => new Date(entry.date).getTime());
	const minTime = Math.min(...times);
	const maxTime = Math.max(...times);

	const bounds: PlotBounds = {
		plotLeft: paddingLeft,
		plotRight: width - paddingRight,
		plotTop: paddingTop,
		plotBottom: height - paddingBottom,
	};
	const { toX, toY } = buildScales(
		bounds,
		{ minTime, maxTime },
		{ minWeight, maxWeight },
	);

	const points: ChartPoint[] = entries.map((entry, index) => ({
		x: toX(times[index]),
		y: toY(entry.weight),
		entry,
	}));

	const yTicks: YTick[] = [
		minWeight,
		(minWeight + maxWeight) / 2,
		maxWeight,
	].map((value) => ({ value, y: toY(value) }));
	const rawXTicks: XTick[] = pickTickIndices(entries.length).map((index) => ({
		date: entries[index].date,
		x: toX(times[index]),
	}));
	const xTicks = withMinSpacing(rawXTicks, minTickSpacing);

	return {
		points,
		polyline: points.map((point) => `${point.x},${point.y}`).join(" "),
		minWeight,
		maxWeight,
		yTicks,
		xTicks,
		...bounds,
	};
};
