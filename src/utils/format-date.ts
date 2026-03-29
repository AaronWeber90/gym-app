export const formatDate = (
	dateStr: string,
	options?: Intl.DateTimeFormatOptions,
) => new Intl.DateTimeFormat("de-DE", options).format(new Date(dateStr));
