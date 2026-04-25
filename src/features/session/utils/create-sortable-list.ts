import { createSignal, onCleanup } from "solid-js";

const EDGE_THRESHOLD = 60;
const SCROLL_SPEED = 12;

export function createSortableList(opts: {
	getLength: () => number;
	onReorder: (fromIndex: number, toIndex: number) => void;
}) {
	const [dragIndex, setDragIndex] = createSignal<number | null>(null);
	const [overIndex, setOverIndex] = createSignal<number | null>(null);

	const itemElements = new Map<number, HTMLElement>();
	let scrollRAF: number | null = null;
	let lastClientY = 0;

	function registerItem(index: number, el: HTMLElement) {
		itemElements.set(index, el);
	}

	function unregisterItem(index: number) {
		itemElements.delete(index);
	}

	function indexFromY(clientY: number): number {
		let closest = 0;
		let closestDist = Number.POSITIVE_INFINITY;

		for (const [i, el] of itemElements) {
			const rect = el.getBoundingClientRect();
			const mid = rect.top + rect.height / 2;
			const dist = Math.abs(clientY - mid);
			if (dist < closestDist) {
				closestDist = dist;
				closest = i;
			}
		}
		return closest;
	}

	function autoScroll() {
		const y = lastClientY;
		const vh = window.innerHeight;

		if (y < EDGE_THRESHOLD) {
			window.scrollBy(0, -SCROLL_SPEED);
		} else if (y > vh - EDGE_THRESHOLD) {
			window.scrollBy(0, SCROLL_SPEED);
		}

		if (dragIndex() !== null) {
			setOverIndex(indexFromY(lastClientY));
			scrollRAF = requestAnimationFrame(autoScroll);
		}
	}

	function onPointerMove(e: PointerEvent) {
		e.preventDefault();
		lastClientY = e.clientY;
		setOverIndex(indexFromY(e.clientY));
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
		if (scrollRAF !== null) {
			cancelAnimationFrame(scrollRAF);
			scrollRAF = null;
		}
		setDragIndex(null);
		setOverIndex(null);
	}

	onCleanup(cleanup);

	function startDrag(index: number, e: PointerEvent) {
		e.preventDefault();
		lastClientY = e.clientY;
		setDragIndex(index);
		setOverIndex(index);
		document.addEventListener("pointermove", onPointerMove);
		document.addEventListener("pointerup", onPointerUp);
		scrollRAF = requestAnimationFrame(autoScroll);
	}

	return {
		dragIndex,
		overIndex,
		startDrag,
		registerItem,
		unregisterItem,
	};
}
