import { DAYS_PER_WEEK } from "./constants";

/** Returns the Monday of the week containing the given date. */
export function getWeekStart(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? 1 - DAYS_PER_WEEK : 1);
	return new Date(d.setDate(diff));
}
