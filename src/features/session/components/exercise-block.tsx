import { createUniqueId, Index, onCleanup, onMount, Show } from "solid-js";
import { GripDotsIcon } from "../../../ui/icons/grip-dots";
import { KebabMenuIcon } from "../../../ui/icons/kebab-menu";
import type { ExerciseData, SetData } from "../utils";
import { SetRow } from "./set-row";

type ExerciseBlockProps = {
	exercise: ExerciseData;
	canRemove: boolean;
	previousSets?: SetData[];
	onNameChange: (name: string) => void;
	onUpdateSet: (setIndex: number, field: keyof SetData, value: number) => void;
	onAddSet: () => void;
	onRemoveSet: (setIndex: number) => void;
	onRemove: () => void;
	isDragging: boolean;
	isAnyDragging: boolean;
	onDragStart: (e: PointerEvent) => void;
	registerItem: (el: HTMLElement) => void;
	unregisterItem: () => void;
};

export const ExerciseBlock = (props: ExerciseBlockProps) => {
	let containerRef!: HTMLDivElement;
	const menuId = createUniqueId();
	const anchorName = `--exercise-menu-${menuId}`;

	onMount(() => props.registerItem(containerRef));
	onCleanup(() => props.unregisterItem());

	return (
		<div
			ref={containerRef}
			class="transition-all duration-150"
			classList={{
				"opacity-50 scale-95": props.isDragging,
			}}
		>
			<div class="flex items-center gap-2 mb-2">
				<button
					class="btn btn-ghost btn-sm btn-square cursor-grab active:cursor-grabbing touch-none select-none"
					onPointerDown={(e) => props.onDragStart(e)}
					type="button"
					aria-label="Übung verschieben"
				>
					<GripDotsIcon />
				</button>
				<input
					type="text"
					class="input input-ghost text-lg font-bold p-0 flex-1 min-w-0"
					value={props.exercise.name}
					placeholder="Übungsname"
					onInput={(e) => props.onNameChange(e.currentTarget.value)}
				/>
				<button
					class="btn btn-ghost btn-sm btn-square"
					popovertarget={menuId}
					style={`anchor-name:${anchorName}`}
					type="button"
					aria-label="Optionen"
				>
					<KebabMenuIcon />
				</button>
				<ul
					class="dropdown menu w-40 rounded-box bg-base-200 shadow-lg"
					popover
					id={menuId}
					style={`position-anchor:${anchorName}`}
				>
					<Show when={props.canRemove}>
						<li>
							<button
								class="text-error"
								type="button"
								onClick={() => props.onRemove()}
							>
								Löschen
							</button>
						</li>
					</Show>
				</ul>
			</div>
			<Show when={!props.isAnyDragging}>
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
									previousSet={props.previousSets?.[setIndex]}
									onUpdate={(field, value) =>
										props.onUpdateSet(setIndex, field, value)
									}
									onRemove={() => props.onRemoveSet(setIndex)}
								/>
							)}
						</Index>
					</tbody>
				</table>
				<div class="flex justify-end">
					<button
						class="btn btn-ghost btn-sm mt-1"
						onClick={props.onAddSet}
						type="button"
					>
						+ Satz
					</button>
				</div>
			</Show>
		</div>
	);
};
