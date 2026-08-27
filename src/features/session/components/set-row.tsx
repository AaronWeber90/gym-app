import { createSignal, Show } from "solid-js";
import type { SetData } from "../utils";
import { normalizeWeightInput } from "../utils/normalize-weight-input";

type SetRowProps = {
	set: SetData;
	index: number;
	canRemove: boolean;
	previousSet?: SetData;
	onUpdate: (field: keyof SetData, value: number | undefined) => void;
	onRemove: () => void;
};

type WeightCellProps = {
	weight: number;
	previousSet?: SetData;
	onUpdate: (value: number) => void;
};

type RepsCellProps = {
	reps: number;
	previousSet?: SetData;
	onUpdate: (value: number) => void;
};

type RpeCellProps = {
	rpe?: number;
	previousSet?: SetData;
	onUpdate: (value: number | undefined) => void;
};

const WeightCell = (props: WeightCellProps) => {
	const [inputValue, setInputValue] = createSignal(
		String(props.weight).replace(".", ","),
	);

	const commitWeight = (rawValue: string) => {
		const normalized = normalizeWeightInput(rawValue);
		setInputValue(rawValue === "" ? "0" : rawValue);
		props.onUpdate(normalized);
	};

	const stepWeight = (direction: 1 | -1) => {
		const current = normalizeWeightInput(inputValue());
		const next = Math.max(0, current + direction * 0.5);
		const normalized = Number(next.toFixed(2));
		setInputValue(String(normalized).replace(".", ","));
		props.onUpdate(normalized);
	};

	return (
		<td class="pl-0">
			<input
				type="text"
				inputMode="decimal"
				class="input input-ghost w-full p-0"
				value={inputValue()}
				min={0}
				max={9999}
				step={0.5}
				onInput={(e) => {
					const rawValue = e.currentTarget.value;
					if (rawValue.replace(/[^0-9,.-]/g, "").length > 6) {
						e.currentTarget.value = rawValue.slice(0, -1);
						return;
					}
					commitWeight(rawValue);
				}}
				onKeyDown={(e) => {
					if (e.key === "ArrowUp") {
						e.preventDefault();
						stepWeight(1);
					}
					if (e.key === "ArrowDown") {
						e.preventDefault();
						stepWeight(-1);
					}
				}}
				onBlur={() => {
					const normalized = normalizeWeightInput(inputValue());
					setInputValue(String(normalized).replace(".", ","));
					props.onUpdate(normalized);
				}}
			/>
			<Show when={props.previousSet}>
				{(prev) => (
					<span class="text-xs text-base-content/50">
						vorher: {prev().weight} kg
					</span>
				)}
			</Show>
		</td>
	);
};

const RepsCell = (props: RepsCellProps) => (
	<td class="pl-0">
		<input
			type="number"
			class="input input-ghost w-full p-0"
			value={props.reps}
			min={0}
			max={9999}
			onInput={(e) => {
				if (e.currentTarget.value.length > 4) {
					e.currentTarget.value = e.currentTarget.value.slice(0, 4);
					return;
				}
				props.onUpdate(Number.parseInt(e.currentTarget.value, 10) || 0);
			}}
		/>
		<Show when={props.previousSet}>
			{(prev) => (
				<span class="text-xs text-base-content/50">vorher: {prev().reps}</span>
			)}
		</Show>
	</td>
);

const RpeCell = (props: RpeCellProps) => (
	<td class="pl-0">
		<input
			type="number"
			class="input input-ghost w-full p-0"
			value={props.rpe ?? ""}
			min={1}
			max={10}
			placeholder="-"
			onInput={(e) => {
				const raw = e.currentTarget.value;
				if (raw === "") {
					props.onUpdate(undefined);
					return;
				}
				const clamped = Math.min(
					10,
					Math.max(1, Number.parseInt(raw, 10) || 1),
				);
				e.currentTarget.value = String(clamped);
				props.onUpdate(clamped);
			}}
		/>
		<Show when={props.previousSet?.rpe}>
			{(prev) => (
				<span class="text-xs text-base-content/50">vorher: {prev()}</span>
			)}
		</Show>
	</td>
);

export const SetRow = (props: SetRowProps) => (
	<tr>
		<td>{props.index + 1}</td>
		<WeightCell
			weight={props.set.weight}
			previousSet={props.previousSet}
			onUpdate={(value) => props.onUpdate("weight", value)}
		/>
		<RepsCell
			reps={props.set.reps}
			previousSet={props.previousSet}
			onUpdate={(value) => props.onUpdate("reps", value)}
		/>
		<RpeCell
			rpe={props.set.rpe}
			previousSet={props.previousSet}
			onUpdate={(value) => props.onUpdate("rpe", value)}
		/>
		<td class="pl-0">
			<Show when={props.canRemove}>
				<button
					class="btn btn-ghost btn-xs btn-circle"
					onClick={props.onRemove}
					type="button"
				>
					✕
				</button>
			</Show>
		</td>
	</tr>
);
