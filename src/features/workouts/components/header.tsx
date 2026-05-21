import type { JSX } from "solid-js";

type Props = {
	title: string;
	action?: JSX.Element;
};

export const Header = (props: Props) => {
	return (
		<div class="flex justify-between items-center mb-4">
			<h1 class="text-3xl font-bold">{props.title}</h1>
			{props.action}
		</div>
	);
};
