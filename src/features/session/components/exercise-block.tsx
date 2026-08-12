import {
	createMemo,
	createUniqueId,
	Index,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { CheckCircleIcon } from "../../../ui/icons/check-circle";
import { GripDotsIcon } from "../../../ui/icons/grip-dots";
import { KebabMenuIcon } from "../../../ui/icons/kebab-menu";
import { Input } from "../../../ui/input";
import { getExerciseSuggestions } from "../../exercises/utils";
import type { ExerciseData, SetData } from "../utils";
import { SetRow } from "./set-row";

type SetsTableProps = {
	sets: SetData[];
	previousSets?: SetData[];
	onUpdateSet: (setIndex: number, field: keyof SetData, value: number) => void;
	onAddSet: () => void;
	onRemoveSet: (setIndex: number) => void;
};

type ExerciseHeaderProps = {
	name: string;
	isComplete: boolean;
	canRemove: boolean;
	onDragStart: (e: PointerEvent) => void;
	onNameChange: (name: string) => void;
	onRemove: () => void;
};

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

const SetsTable = (props: SetsTableProps) => (
	<>
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
				<Index each={props.sets}>
					{(set, setIndex) => (
						<SetRow
							set={set()}
							index={setIndex}
							canRemove={props.sets.length > 1}
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
	</>
);

const ExerciseHeader = (props: ExerciseHeaderProps) => {
	const menuId = createUniqueId();
	const datalistId = createUniqueId();
	const anchorName = `--exercise-menu-${menuId}`;

	return (
		<>
			<div class="flex items-center gap-2 mb-2">
				<button
					class="btn btn-ghost btn-sm btn-square cursor-grab active:cursor-grabbing touch-none select-none"
					onPointerDown={(e) => props.onDragStart(e)}
					type="button"
					aria-label="Übung verschieben"
				>
					<GripDotsIcon />
				</button>
				<Input
					type="text"
					class="input input-ghost text-lg font-bold p-0 flex-1 min-w-0"
					value={props.name}
					placeholder="Übungsname"
					list={datalistId}
					onInput={(e) => props.onNameChange(e.currentTarget.value)}
				/>
				<Show when={props.isComplete}>
					<span class="text-primary shrink-0">
						<CheckCircleIcon />
					</span>
				</Show>
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
			<datalist id={datalistId}>
				{getExerciseSuggestions().map((exercise) => (
					<option value={exercise} />
				))}
			</datalist>
		</>
	);
};

export const ExerciseBlock = (props: ExerciseBlockProps) => {
	let containerRef!: HTMLDivElement;

	const isComplete = createMemo(
		() =>
			props.exercise.name.trim().length > 0 &&
			props.exercise.sets.length > 0 &&
			props.exercise.sets.every((s) => s.weight > 0 && s.reps > 0),
	);

	onMount(() => props.registerItem(containerRef));
	onCleanup(() => props.unregisterItem());

	return (
		<div
			ref={containerRef}
			class="transition-all duration-150 border-l-4 pl-2"
			classList={{
				"opacity-50 scale-95": props.isDragging,
				"border-primary": isComplete(),
				"border-transparent": !isComplete(),
			}}
		>
			<ExerciseHeader
				name={props.exercise.name}
				isComplete={isComplete()}
				canRemove={props.canRemove}
				onDragStart={props.onDragStart}
				onNameChange={props.onNameChange}
				onRemove={props.onRemove}
			/>
			<Show when={!props.isAnyDragging}>
				<SetsTable
					sets={props.exercise.sets}
					previousSets={props.previousSets}
					onUpdateSet={props.onUpdateSet}
					onAddSet={props.onAddSet}
					onRemoveSet={props.onRemoveSet}
				/>
			</Show>
		</div>
	);
};
