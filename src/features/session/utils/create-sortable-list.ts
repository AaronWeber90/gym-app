import { createSignal, onCleanup, type Setter } from "solid-js";

const EDGE_THRESHOLD = 60;
const SCROLL_SPEED = 12;

type SortableContext = {
	getDragIndex: () => number | null;
	setDragIndex: Setter<number | null>;
	overIndex: () => number | null;
	setOverIndex: Setter<number | null>;
	itemElements: Map<number, HTMLElement>;
	scrollRAF: number | null;
	lastClientY: number;
	onReorder: (fromIndex: number, toIndex: number) => void;
	onPointerMove: (e: PointerEvent) => void;
	onPointerUp: () => void;
};

function indexFromY(
	itemElements: Map<number, HTMLElement>,
	clientY: number,
): number {
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

function autoScroll(ctx: SortableContext) {
	const y = ctx.lastClientY;
	const vh = window.innerHeight;

	if (y < EDGE_THRESHOLD) {
		window.scrollBy(0, -SCROLL_SPEED);
	} else if (y > vh - EDGE_THRESHOLD) {
		window.scrollBy(0, SCROLL_SPEED);
	}

	if (ctx.getDragIndex() !== null) {
		ctx.setOverIndex(indexFromY(ctx.itemElements, ctx.lastClientY));
		ctx.scrollRAF = requestAnimationFrame(() => autoScroll(ctx));
	}
}

function cleanup(ctx: SortableContext) {
	document.removeEventListener("pointermove", ctx.onPointerMove);
	document.removeEventListener("pointerup", ctx.onPointerUp);
	document.body.style.userSelect = "";
	if (ctx.scrollRAF !== null) {
		cancelAnimationFrame(ctx.scrollRAF);
		ctx.scrollRAF = null;
	}
	ctx.setDragIndex(null);
	ctx.setOverIndex(null);
}

function handlePointerMove(ctx: SortableContext, e: PointerEvent) {
	e.preventDefault();
	ctx.lastClientY = e.clientY;
	ctx.setOverIndex(indexFromY(ctx.itemElements, e.clientY));
}

function handlePointerUp(ctx: SortableContext) {
	const from = ctx.getDragIndex();
	const to = ctx.overIndex();

	cleanup(ctx);

	if (from !== null && to !== null && from !== to) {
		ctx.onReorder(from, to);
	}
}

function startDrag(ctx: SortableContext, index: number, e: PointerEvent) {
	e.preventDefault();
	document.body.style.userSelect = "none";
	ctx.lastClientY = e.clientY;
	ctx.setDragIndex(index);
	ctx.setOverIndex(index);
	document.addEventListener("pointermove", ctx.onPointerMove);
	document.addEventListener("pointerup", ctx.onPointerUp);
	ctx.scrollRAF = requestAnimationFrame(() => autoScroll(ctx));
}

export function createSortableList(opts: {
	getLength: () => number;
	onReorder: (fromIndex: number, toIndex: number) => void;
}) {
	const [dragIndex, setDragIndex] = createSignal<number | null>(null);
	const [overIndex, setOverIndex] = createSignal<number | null>(null);

	const ctx: SortableContext = {
		getDragIndex: dragIndex,
		setDragIndex,
		overIndex,
		setOverIndex,
		itemElements: new Map<number, HTMLElement>(),
		scrollRAF: null,
		lastClientY: 0,
		onReorder: opts.onReorder,
		onPointerMove: (e) => handlePointerMove(ctx, e),
		onPointerUp: () => handlePointerUp(ctx),
	};

	onCleanup(() => cleanup(ctx));

	return {
		dragIndex,
		overIndex,
		startDrag: (index: number, e: PointerEvent) => startDrag(ctx, index, e),
		registerItem: (index: number, el: HTMLElement) =>
			ctx.itemElements.set(index, el),
		unregisterItem: (index: number) => ctx.itemElements.delete(index),
	};
}
