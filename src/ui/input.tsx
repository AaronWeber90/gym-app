import { createUniqueId, type JSX } from "solid-js";

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	value: string | number | readonly string[] | undefined;
	type: "date" | "text" | "number" | "password" | "email" | "search" | "time";
};

export const Input = (props: InputProps) => {
	const id = createUniqueId();
	return (
		<div class="flex flex-col gap-1">
			{props.label && (
				<label class="label" for={id}>
					<span class="label-text">{props.label}</span>
				</label>
			)}
			<input
				{...props}
				type={props.type}
				class={`input w-full ${props.class || ""}`}
				id={id}
				value={props.value}
			/>
		</div>
	);
};
