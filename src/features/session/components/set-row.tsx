import { Show } from "solid-js";
import type { SetData } from "../utils";

type SetRowProps = {
	set: SetData;
	index: number;
	canRemove: boolean;
	onUpdate: (field: keyof SetData, value: number) => void;
	onRemove: () => void;
};

export const SetRow = (props: SetRowProps) => {
	return (
		<tr>
			<td>{props.index + 1}</td>
			<td>
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
			</td>
			<td>
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
			</td>
			<td>
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
