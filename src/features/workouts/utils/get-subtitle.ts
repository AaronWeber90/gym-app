import { formatDate } from "../../../utils/format-date";

export const getSubtitle = (lastTrainedAt: string | null) => {
	if (!lastTrainedAt) return "Noch nicht trainiert";
	const isToday =
		new Date(lastTrainedAt).toDateString() === new Date().toDateString();
	if (isToday) return "Zuletzt trainiert";
	return `Zuletzt trainiert: ${formatDate(lastTrainedAt)}`;
};
