import { type JSX, splitProps } from "solid-js";

type ButtonVariant = "primary" | "secondary" | "ghost" | "square-ghost";

type ButtonProps = {
	variant?: ButtonVariant;
	children: JSX.Element;
	onClick?: () => void;
};

export const Button = (props: ButtonProps) => {
	const [local] = splitProps(props, ["variant", "children", "onClick"]);

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
			default:
				return "btn";
		}
	};

	return (
		<button class={`${variantClasses()}`} onClick={local.onClick} type="button">
			{local.children}
		</button>
	);
};
