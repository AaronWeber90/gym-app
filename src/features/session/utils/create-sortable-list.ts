import { createSignal, onCleanup } from "solid-js";

export function createSortableList(opts: {
	getLength: () => number;
	onReorder: (fromIndex: number, toIndex: number) => void;
}) {
	const [dragIndex, setDragIndex] = createSignal<number | null>(null);
	const [overIndex, setOverIndex] = createSignal<number | null>(null);

	const itemRects = new Map<number, DOMRect>();
	const itemElements = new Map<number, HTMLElement>();

	function registerItem(index: number, el: HTMLElement) {
		itemElements.set(index, el);
	}

	function unregisterItem(index: number) {
		itemElements.delete(index);
		itemRects.delete(index);
	}

	function snapshotRects() {
		itemRects.clear();
		for (const [i, el] of itemElements) {
			itemRects.set(i, el.getBoundingClientRect());
		}
	}

	function indexFromY(clientY: number): number {
		let closest = 0;
		let closestDist = Number.POSITIVE_INFINITY;

		for (const [i, rect] of itemRects) {
			const mid = rect.top + rect.height / 2;
			const dist = Math.abs(clientY - mid);
			if (dist < closestDist) {
				closestDist = dist;
				closest = i;
			}
		}
		return closest;
	}

	function onPointerMove(e: PointerEvent) {
		e.preventDefault();
		const target = indexFromY(e.clientY);
		setOverIndex(target);
	}

	function onPointerUp() {
		const from = dragIndex();
		const to = overIndex();

		cleanup();

		if (from !== null && to !== null && from !== to) {
			opts.onReorder(from, to);
		}
	}

	function cleanup() {
		document.removeEventListener("pointermove", onPointerMove);
		document.removeEventListener("pointerup", onPointerUp);
		setDragIndex(null);
		setOverIndex(null);
	}

	onCleanup(cleanup);

	function startDrag(index: number, e: PointerEvent) {
		e.preventDefault();
		snapshotRects();
		setDragIndex(index);
		setOverIndex(index);
		document.addEventListener("pointermove", onPointerMove);
		document.addEventListener("pointerup", onPointerUp);
	}

	return {
		dragIndex,
		overIndex,
		startDrag,
		registerItem,
		unregisterItem,
	};
}
