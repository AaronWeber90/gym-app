import { A } from "@solidjs/router";
import type { Component, JSX } from "solid-js";

type ListItemProps = {
	href: string;
	icon: JSX.Element;
	title: string;
	subtitle: string;
};

export const ListItem: Component<ListItemProps> = (props) => {
	return (
		<A href={props.href}>
			<li class="flex items-center justify-between p-3 hover:bg-base-200 transition">
				<div class="flex items-center gap-3">
					{props.icon}
					<div>
						<div class="font-medium">{props.title}</div>
						<div class="text-xs font-semibold opacity-60">{props.subtitle}</div>
					</div>
				</div>
			</li>
		</A>
	);
};
