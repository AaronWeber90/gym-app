import { type JSX, splitProps } from "solid-js";

type ButtonVariant =
	| "primary"
	| "secondary"
	| "ghost"
	| "square-ghost"
	| "dock"
	| "dock-active";

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	children: JSX.Element;
};

export const Button = (props: ButtonProps) => {
	const [local, others] = splitProps(props, ["variant", "children", "class"]);

	const variantClasses = () => {
		switch (local.variant) {
			case "primary":
				return "btn btn-primary";
			case "secondary":
				return "btn btn-secondary";
			case "ghost":
				return "btn btn-ghost";
			case "square-ghost":
				return "btn btn-square btn-ghost";
			case "dock":
				return "";
			case "dock-active":
				return "dock-active";
			default:
				return "btn";
		}
	};

	return (
		<button
			{...others}
			class={`${variantClasses()} ${local.class ?? ""}`}
			type={others.type || "button"}
		>
			{local.children}
		</button>
	);
};
