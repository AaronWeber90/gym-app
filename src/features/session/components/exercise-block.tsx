import { Index, Show } from "solid-js";
import type { ExerciseData, SetData } from "../utils";
import { SetRow } from "./set-row";

type ExerciseBlockProps = {
	exercise: ExerciseData;
	canRemove: boolean;
	onNameChange: (name: string) => void;
	onUpdateSet: (setIndex: number, field: keyof SetData, value: number) => void;
	onAddSet: () => void;
	onRemoveSet: (setIndex: number) => void;
	onRemove: () => void;
};

export const ExerciseBlock = (props: ExerciseBlockProps) => {
	return (
		<div>
			<div class="flex items-center gap-2 mb-2">
				<input
					type="text"
					class="input input-ghost text-lg font-bold p-0"
					value={props.exercise.name}
					placeholder="Übungsname"
					onInput={(e) => props.onNameChange(e.currentTarget.value)}
				/>
				<Show when={props.canRemove}>
					<button
						class="btn btn-ghost btn-xs btn-circle"
						onClick={props.onRemove}
						type="button"
					>
						✕
					</button>
				</Show>
			</div>
			<table class="table">
				<thead>
					<tr>
						<th>Satz</th>
						<th>Gewicht (kg)</th>
						<th>Wdh.</th>
						<th />
					</tr>
				</thead>
				<tbody>
					<Index each={props.exercise.sets}>
						{(set, setIndex) => (
							<SetRow
								set={set()}
								index={setIndex}
								canRemove={props.exercise.sets.length > 1}
								onUpdate={(field, value) =>
									props.onUpdateSet(setIndex, field, value)
								}
								onRemove={() => props.onRemoveSet(setIndex)}
							/>
						)}
					</Index>
				</tbody>
			</table>
			<button
				class="btn btn-ghost btn-xs mt-1"
				onClick={props.onAddSet}
				type="button"
			>
				+ Satz
			</button>
		</div>
	);
};
