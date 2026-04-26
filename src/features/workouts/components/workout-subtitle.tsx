import type { Component } from "solid-js";
import { Badge } from "../../../ui/badge";
import { formatDate } from "../../../utils/format-date";

type WorkoutSubtitleProps = {
	lastTrainedAt: string | null;
};

export const WorkoutSubtitle: Component<WorkoutSubtitleProps> = (props) => {
	if (!props.lastTrainedAt) return <>Noch nicht trainiert</>;
	const isToday =
		new Date(props.lastTrainedAt).toDateString() === new Date().toDateString();
	if (isToday)
		return (
			<>
				Zuletzt trainiert{" "}
				<Badge variant="neutral" size="sm">
					Heute
				</Badge>
			</>
		);
	return <>Zuletzt trainiert: {formatDate(props.lastTrainedAt)}</>;
};
