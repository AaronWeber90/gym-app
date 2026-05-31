import type { IconProps } from "./types";

export const SortIcon = (props: IconProps) => (
	<svg
		class={`size-[1.2em] ${props.class ?? ""}`}
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<title>filter-icon</title>
		<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
	</svg>
);
