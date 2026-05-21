import type { JSX } from "solid-js";
import { createUniqueId, splitProps } from "solid-js";

type InputProps = Omit<
	JSX.InputHTMLAttributes<HTMLInputElement>,
	"label" | "type"
> & {
	label?: string;
	type: "date" | "text" | "number" | "search" | "time";
};

export const Input = (props: InputProps) => {
	const generatedId = createUniqueId();
	const [local, inputProps] = splitProps(props, [
		"label",
		"type",
		"class",
		"id",
	]);
	const inputId = local.id ?? generatedId;

	const input = (
		<input
			{...inputProps}
			type={local.type}
			class={`input w-full ${local.class ?? ""}`.trim()}
			id={local.label ? inputId : local.id}
		/>
	);

	if (!local.label) return input;

	return (
		<div class="flex flex-col gap-1">
			<label class="label" for={inputId}>
				<span class="label-text">{local.label}</span>
			</label>
			{input}
		</div>
	);
};
