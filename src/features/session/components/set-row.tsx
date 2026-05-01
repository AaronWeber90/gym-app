import { Show } from "solid-js";
import type { SetData } from "../utils";

type SetRowProps = {
	set: SetData;
	index: number;
	canRemove: boolean;
	previousSet?: SetData;
	onUpdate: (field: keyof SetData, value: number) => void;
	onRemove: () => void;
};

export const SetRow = (props: SetRowProps) => {
	return (
		<tr>
			<td>{props.index + 1}</td>
			<td class="pl-0">
				<input
					type="number"
					class="input input-ghost w-full p-0"
					value={props.set.weight}
					min={0}
					step={2.5}
					onInput={(e) =>
						props.onUpdate(
							"weight",
							Number.parseFloat(e.currentTarget.value) || 0,
						)
					}
				/>
				<Show when={props.previousSet}>
					{(prev) => (
						<span class="text-xs text-base-content/50">
							vorher: {prev().weight} kg
						</span>
					)}
				</Show>
			</td>
			<td class="pl-0">
				<input
					type="number"
					class="input input-ghost w-full p-0"
					value={props.set.reps}
					min={0}
					onInput={(e) =>
						props.onUpdate(
							"reps",
							Number.parseInt(e.currentTarget.value, 10) || 0,
						)
					}
				/>
				<Show when={props.previousSet}>
					{(prev) => (
						<span class="text-xs text-base-content/50">
							vorher: {prev().reps}
						</span>
					)}
				</Show>
			</td>
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
};
