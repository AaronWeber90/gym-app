import type { JSX } from "solid-js";

type Props = {
	title?: string;
	subtitle?: string;
	children: JSX.Element;
};

export const Section = (props: Props) => {
	return (
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body gap-4">
				{props.title && <h2 class="card-title text-lg">{props.title}</h2>}
				{props.subtitle && (
					<p class="text-sm text-base-content/60">{props.subtitle}</p>
				)}
				{props.children}
			</div>
		</div>
	);
};
