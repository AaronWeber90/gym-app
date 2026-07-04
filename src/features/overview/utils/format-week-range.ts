import { monthNames } from "./constants";
import type { WeekDay } from "./types";

export function formatWeekRange(days: WeekDay[]): string {
	if (days.length === 0) return "";

	const start = days[0].date;
	const end = days[6].date;

	if (start.getMonth() === end.getMonth()) {
		return `${start.getDate()}. - ${end.getDate()}. ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
	}
	return `${start.getDate()}. ${monthNames[start.getMonth()]} - ${end.getDate()}. ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
}
