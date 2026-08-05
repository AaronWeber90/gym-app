import { createUniqueId, type JSX } from "solid-js";
import { Button } from "./button";

type DropdownProps = {
	triggerAriaLabel: string;
	triggerIcon: JSX.Element;
	children: JSX.Element;
	menuClass?: string;
	triggerClass?: string;
	triggerVariant?:
		| "primary"
		| "secondary"
		| "ghost"
		| "square-ghost"
		| "dock"
		| "dock-active";
};

export const Dropdown = (props: DropdownProps) => {
	const menuId = createUniqueId();
	const anchorName = `--dropdown-${menuId}`;

	return (
		<div style={`anchor-name:${anchorName}`}>
			<Button
				variant={props.triggerVariant ?? "square-ghost"}
				class={props.triggerClass}
				popovertarget={menuId}
				type="button"
				aria-label={props.triggerAriaLabel}
			>
				{props.triggerIcon}
			</Button>
			<ul
				class={`dropdown menu w-40 rounded-box bg-base-200 shadow-lg ${props.menuClass ?? ""}`}
				popover
				id={menuId}
				style={`position-anchor:${anchorName}`}
			>
				{props.children}
			</ul>
		</div>
	);
};
