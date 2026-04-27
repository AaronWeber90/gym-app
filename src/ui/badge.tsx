import type { Component, JSX } from "solid-js";

type BadgeProps = {
	variant: "neutral" | "primary";
	size: "sm" | "md" | "lg";
	children: JSX.Element;
};

const variantClass = {
	neutral: "badge-neutral",
	primary: "badge-primary",
} as const;

const sizeClass = {
	sm: "badge-sm",
	md: "badge-md",
	lg: "badge-lg",
} as const;

export const Badge: Component<BadgeProps> = (props) => {
	return (
		<span
			class={`badge ${variantClass[props.variant]} ${sizeClass[props.size]}`}
		>
			{props.children}
		</span>
	);
};
