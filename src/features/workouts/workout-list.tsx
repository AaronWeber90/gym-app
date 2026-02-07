import type { JSX } from "solid-js";

type WorkoutListProps = {
	children: JSX.Element;
};

export const WorkoutList = (props: WorkoutListProps) => {
	return (
		<ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
			{props.children}
		</ul>
	);
};
