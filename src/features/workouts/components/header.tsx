type Props = {
	title: string;
};

export const Header = (props: Props) => {
	return (
		<div class="flex justify-between items-center mb-4">
			<h1 class="text-3xl font-bold">{props.title}</h1>
		</div>
	);
};
