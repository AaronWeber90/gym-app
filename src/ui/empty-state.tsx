import type { Component } from "solid-js";

export const EmptyState: Component<{ message: string }> = (props) => {
	return (
		<div class="text-center text-base-content/50 py-8">{props.message}</div>
	);
};
