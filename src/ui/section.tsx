import { type JSX, Show } from "solid-js";

type Props = {
	title?: string;
	subtitle?: string;
	children: JSX.Element;
};

export const Section = (props: Props) => (
	<div class="card bg-base-100 shadow-sm">
		<div class="card-body gap-4">
			<Show when={props.title}>
				<h2 class="card-title text-lg">{props.title}</h2>
			</Show>
			<Show when={props.subtitle}>
				<p class="text-sm text-base-content/60">{props.subtitle}</p>
			</Show>
			{props.children}
		</div>
	</div>
);
