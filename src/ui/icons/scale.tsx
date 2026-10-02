import type { IconProps } from "./types";

export const ScaleIcon = (props: IconProps) => (
	<svg
		class={props.class || ""}
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
	>
		<title>scale-icon</title>
		<g
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
		>
			<rect x="3" y="12" width="18" height="9" rx="2" />
			<path d="M8 12V7a4 4 0 0 1 8 0v5" />
			<path d="M12 15.5v2" />
		</g>
	</svg>
);
