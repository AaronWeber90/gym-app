// biome-ignore-all lint/style/noMagicNumbers: SVG layout offsets in px
import type { BodyWeightEntry } from "@api";
import { createSignal, For, Show } from "solid-js";
import { formatDate } from "../../../utils/format-date";
import {
	type ChartLayout,
	type ChartPoint,
	computeChartPoints,
} from "../utils/compute-chart-points";

type BodyWeightChartProps = {
	entries: BodyWeightEntry[];
};

const MIN_CHART_WIDTH = 320;
// wider charts get more entries; scroll horizontally instead of squeezing points together
const PIXELS_PER_ENTRY = 36;
const CHART_HEIGHT = 160;
const PADDING_LEFT = 22;
const PADDING_RIGHT = 12;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 20;
const TOOLTIP_HALF_WIDTH = 34;

const clampX = (x: number, width: number) =>
	Math.min(Math.max(x, TOOLTIP_HALF_WIDTH), width - TOOLTIP_HALF_WIDTH);

type ChartGridProps = {
	layout: ChartLayout;
};

// thin horizontal/vertical lines behind the plot marking each axis tick
const ChartGrid = (props: ChartGridProps) => (
	<g class="stroke-base-300" stroke-width="0.5">
		<For each={props.layout.yTicks}>
			{(tick) => (
				<line
					x1={props.layout.plotLeft}
					x2={props.layout.plotRight}
					y1={tick.y}
					y2={tick.y}
				/>
			)}
		</For>
		<For each={props.layout.xTicks}>
			{(tick) => (
				<line
					x1={tick.x}
					x2={tick.x}
					y1={props.layout.plotTop}
					y2={props.layout.plotBottom}
				/>
			)}
		</For>
	</g>
);

type ChartAxesProps = {
	layout: ChartLayout;
};

// keeps date labels inside the chart bounds regardless of how many ticks survived the spacing filter
const xTickAnchor = (x: number, layout: ChartLayout) => {
	const relative = (x - layout.plotLeft) / (layout.plotRight - layout.plotLeft);
	if (relative < 0.15) {
		return "start";
	}
	if (relative > 0.85) {
		return "end";
	}
	return "middle";
};

// weight axis on the left, time axis along the bottom
const ChartAxes = (props: ChartAxesProps) => (
	<g class="fill-base-content/60" font-size="8">
		<For each={props.layout.yTicks}>
			{(tick) => (
				<text
					x={props.layout.plotLeft - 2}
					y={tick.y}
					text-anchor="end"
					dominant-baseline="middle"
				>
					{Math.round(tick.value * 10) / 10}
				</text>
			)}
		</For>
		<For each={props.layout.xTicks}>
			{(tick) => (
				<text
					x={tick.x}
					y={props.layout.plotBottom + 12}
					text-anchor={xTickAnchor(tick.x, props.layout)}
				>
					{formatDate(tick.date, { day: "2-digit", month: "2-digit" })}
				</text>
			)}
		</For>
	</g>
);

type ChartPointsProps = {
	points: ChartPoint[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
};

const ChartPoints = (props: ChartPointsProps) => (
	<For each={props.points}>
		{(point, index) => {
			const label = `${point.entry.weight} kg am ${formatDate(point.entry.date, { day: "2-digit", month: "2-digit" })}`;
			const select = () => props.onSelect(index());
			return (
				// biome-ignore lint/a11y/useSemanticElements: <button> is not a valid SVG element
				<circle
					cx={point.x}
					cy={point.y}
					r={props.selectedIndex === index() ? 7 : 5}
					class="fill-primary cursor-pointer"
					role="button"
					tabIndex={0}
					aria-label={label}
					onClick={select}
					onKeyDown={(e) => {
						if (e.key !== "Enter" && e.key !== " ") {
							return;
						}
						e.preventDefault();
						select();
					}}
				/>
			);
		}}
	</For>
);

type ChartTooltipProps = {
	point: ChartPoint;
	width: number;
};

const ChartTooltip = (props: ChartTooltipProps) => (
	<g>
		<rect
			x={clampX(props.point.x, props.width) - TOOLTIP_HALF_WIDTH}
			y={Math.max(props.point.y - 30, 0)}
			width={TOOLTIP_HALF_WIDTH * 2}
			height="24"
			rx="4"
			class="fill-base-100 stroke-base-300"
			stroke-width="1"
		/>
		<text
			x={clampX(props.point.x, props.width)}
			y={Math.max(props.point.y - 15, 14)}
			text-anchor="middle"
			class="fill-base-content"
			font-size="10"
		>
			{props.point.entry.weight} kg
		</text>
		<text
			x={clampX(props.point.x, props.width)}
			y={Math.max(props.point.y - 4, 24)}
			text-anchor="middle"
			class="fill-base-content/60"
			font-size="8"
		>
			{formatDate(props.point.entry.date, {
				day: "2-digit",
				month: "2-digit",
			})}
		</text>
	</g>
);

export const BodyWeightChart = (props: BodyWeightChartProps) => {
	const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);

	const chartWidth = () =>
		Math.max(MIN_CHART_WIDTH, props.entries.length * PIXELS_PER_ENTRY);

	const layout = () =>
		computeChartPoints(props.entries, {
			width: chartWidth(),
			height: CHART_HEIGHT,
			paddingLeft: PADDING_LEFT,
			paddingRight: PADDING_RIGHT,
			paddingTop: PADDING_TOP,
			paddingBottom: PADDING_BOTTOM,
		});

	const selectedPoint = () => {
		const index = selectedIndex();
		return index === null ? null : layout().points[index];
	};

	const toggleSelection = (index: number) =>
		setSelectedIndex(selectedIndex() === index ? null : index);

	return (
		<Show
			when={props.entries.length > 0}
			fallback={
				<div class="text-center text-base-content/50 py-8">
					Noch keine Einträge vorhanden
				</div>
			}
		>
			{/* fixed-size SVG stays legible; excess width scrolls instead of stretching/squeezing */}
			<div class="overflow-x-auto">
				<svg
					viewBox={`0 0 ${chartWidth()} ${CHART_HEIGHT}`}
					width={chartWidth()}
					height={CHART_HEIGHT}
					role="img"
					aria-label="Gewichtsverlauf"
				>
					<title>Gewichtsverlauf</title>
					<ChartGrid layout={layout()} />
					<ChartAxes layout={layout()} />
					<polyline
						points={layout().polyline}
						fill="none"
						class="stroke-primary"
						stroke-width="2"
					/>
					<ChartPoints
						points={layout().points}
						selectedIndex={selectedIndex()}
						onSelect={toggleSelection}
					/>
					<Show when={selectedPoint()}>
						{(point) => <ChartTooltip point={point()} width={chartWidth()} />}
					</Show>
				</svg>
			</div>
		</Show>
	);
};
