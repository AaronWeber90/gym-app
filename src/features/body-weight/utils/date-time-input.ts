export const toDateInputValue = (iso: string): string => {
	const date = new Date(iso);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const toTimeInputValue = (iso: string): string => {
	const date = new Date(iso);
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
};

// dateValue/timeValue are local wall-clock values from <input type="date"/"time">
export const combineDateAndTime = (
	dateValue: string,
	timeValue: string,
): string => {
	const [year, month, day] = dateValue.split("-").map(Number);
	const [hours, minutes] = timeValue.split(":").map(Number);
	return new Date(year, month - 1, day, hours, minutes).toISOString();
};
