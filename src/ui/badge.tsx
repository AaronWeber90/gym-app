import type { Component, JSX } from "solid-js";

type BadgeProps = {
	variant: "neutral" | "primary";
	size: "sm" | "md" | "lg";
	children: JSX.Element;
};

export const Badge: Component<BadgeProps> = (props) => {
	return (
		<span class={`badge badge-${props.variant} badge-${props.size}`}>
			{props.children}
		</span>
	);
};
