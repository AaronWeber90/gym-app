export type DayWorkout = {
	id: string;
	name: string;
	sessionId: string;
	timestamp: string;
};

export type WeekDay = {
	date: Date;
	dayName: string;
	workouts: DayWorkout[];
};
