import { createUniqueId, Index, onCleanup, onMount, Show } from "solid-js";
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
	isDragging: boolean;
	isOver: boolean;
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
				"border-t-2 border-primary": props.isOver && !props.isDragging,
			}}
		>
			<div class="flex items-center gap-2 mb-2">
				<input
					type="text"
					class="input input-ghost text-lg font-bold p-0 flex-1 min-w-0"
					value={props.exercise.name}
					placeholder="Übungsname"
					onInput={(e) => props.onNameChange(e.currentTarget.value)}
				/>
				<button
					class="btn btn-ghost btn-xs btn-square cursor-grab active:cursor-grabbing touch-none"
					onPointerDown={(e) => props.onDragStart(e)}
					type="button"
					aria-label="Übung verschieben"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="9" cy="5" r="1" />
						<circle cx="9" cy="12" r="1" />
						<circle cx="9" cy="19" r="1" />
						<circle cx="15" cy="5" r="1" />
						<circle cx="15" cy="12" r="1" />
						<circle cx="15" cy="19" r="1" />
					</svg>
				</button>
				<button
					class="btn btn-ghost btn-xs btn-square"
					popovertarget={menuId}
					style={`anchor-name:${anchorName}`}
					type="button"
					aria-label="Optionen"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
					>
						<circle cx="12" cy="5" r="2" />
						<circle cx="12" cy="12" r="2" />
						<circle cx="12" cy="19" r="2" />
					</svg>
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
