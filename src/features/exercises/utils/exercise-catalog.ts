export type MuscleGroup =
	| "chest"
	| "back"
	| "shoulders"
	| "traps"
	| "biceps"
	| "triceps"
	| "forearms"
	| "quadriceps"
	| "hamstrings"
	| "glutes"
	| "calves"
	| "core";

export type CatalogExercise = {
	name: string;
	aliases?: string[];
	muscleGroups: MuscleGroup[];
};

export const EXERCISE_CATALOG: CatalogExercise[] = [
	// Compound — Upper Body
	{
		name: "Bankdrücken",
		aliases: ["Barbell Bench Press", "Flachbank"],
		muscleGroups: ["chest", "triceps", "shoulders"],
	},
	{
		name: "Kurzhantel-Bankdrücken",
		aliases: ["Dumbbell Bench Press"],
		muscleGroups: ["chest", "triceps", "shoulders"],
	},
	{
		name: "Schrägbank-Bankdrücken",
		aliases: ["Incline Bench Press"],
		muscleGroups: ["chest", "shoulders", "triceps"],
	},
	{
		name: "Enges Bankdrücken",
		aliases: ["Close-Grip Bench Press"],
		muscleGroups: ["triceps", "chest"],
	},
	{
		name: "Liegestütze",
		aliases: ["Push-Ups", "Push Ups"],
		muscleGroups: ["chest", "triceps", "shoulders"],
	},
	{
		name: "Klimmzüge",
		aliases: ["Pull-Ups", "Pullups"],
		muscleGroups: ["back", "biceps"],
	},
	{
		name: "Latzug",
		aliases: ["Lat Pulldown"],
		muscleGroups: ["back", "biceps"],
	},
	{
		name: "Rudern",
		aliases: ["Barbell Row", "Langhantel-Rudern"],
		muscleGroups: ["back", "biceps"],
	},
	{
		name: "Kurzhantel-Rudern",
		aliases: ["Dumbbell Row"],
		muscleGroups: ["back", "biceps"],
	},
	{
		name: "Kabelrudern",
		aliases: ["Cable Row"],
		muscleGroups: ["back", "biceps"],
	},
	{
		name: "Nackenheben",
		aliases: ["Shrugs", "Schulterheben"],
		muscleGroups: ["traps", "shoulders"],
	},
	{
		name: "Überkopfdrücken",
		aliases: ["Overhead Press", "Schulterpresse"],
		muscleGroups: ["shoulders", "triceps"],
	},
	{
		name: "Kurzhantel-Schulterdrücken",
		aliases: ["Dumbbell Shoulder Press"],
		muscleGroups: ["shoulders", "triceps"],
	},
	{
		name: "Arnold Press",
		aliases: ["Arnold-Drücken"],
		muscleGroups: ["shoulders", "triceps"],
	},

	// Compound — Lower Body
	{
		name: "Kniebeuge",
		aliases: ["Squat", "Langhantel-Kniebeuge"],
		muscleGroups: ["quadriceps", "glutes", "hamstrings"],
	},
	{
		name: "Frontkniebeuge",
		aliases: ["Front Squat"],
		muscleGroups: ["quadriceps", "glutes", "core"],
	},
	{
		name: "Ausfallschritte",
		aliases: ["Lunges", "Walking Lunges"],
		muscleGroups: ["quadriceps", "glutes", "hamstrings"],
	},
	{
		name: "Bulgarian Split Squat",
		aliases: ["Bulgarische Kniebeuge"],
		muscleGroups: ["quadriceps", "glutes", "hamstrings"],
	},
	{
		name: "Kreuzheben",
		aliases: ["Deadlift", "Konventionelles Kreuzheben"],
		muscleGroups: ["hamstrings", "glutes", "back"],
	},
	{
		name: "Romanian Deadlift",
		aliases: ["RDL", "Rumänisches Kreuzheben"],
		muscleGroups: ["hamstrings", "glutes", "back"],
	},
	{
		name: "Hüftstoß",
		aliases: ["Hip Thrust", "Glute Bridge"],
		muscleGroups: ["glutes", "hamstrings"],
	},
	{
		name: "Beinpresse",
		aliases: ["Leg Press"],
		muscleGroups: ["quadriceps", "glutes", "hamstrings"],
	},
	{
		name: "Hackmaschine",
		aliases: ["Hack Squat"],
		muscleGroups: ["quadriceps", "glutes"],
	},

	// Isolation — Chest
	{
		name: "Butterfly",
		aliases: ["Pec Deck", "Fliegende"],
		muscleGroups: ["chest"],
	},
	{
		name: "Kabelfliegende",
		aliases: ["Cable Fly", "Cable Crossover"],
		muscleGroups: ["chest"],
	},
	{
		name: "Brustpresse",
		aliases: ["Chest Press Machine"],
		muscleGroups: ["chest", "triceps"],
	},

	// Isolation — Back
	{
		name: "Facepulls",
		aliases: ["Face Pulls"],
		muscleGroups: ["back", "shoulders", "traps"],
	},
	{
		name: "Reverse Butterfly",
		aliases: ["Reverse Pec Deck", "Fliegende hinten"],
		muscleGroups: ["back", "shoulders"],
	},

	// Isolation — Arms
	{
		name: "Kurzhantel-Bizeps-Curl",
		aliases: ["Dumbbell Curl"],
		muscleGroups: ["biceps"],
	},
	{
		name: "Stange-Bizeps-Curl",
		aliases: ["Barbell Curl"],
		muscleGroups: ["biceps"],
	},
	{
		name: "Kabel-Bizeps-Curl",
		aliases: ["Cable Curl"],
		muscleGroups: ["biceps"],
	},
	{
		name: "Hammer-Curl",
		aliases: ["Hammer Curl"],
		muscleGroups: ["biceps", "forearms"],
	},
	{
		name: "Konzentrationscurls",
		aliases: ["Concentration Curl"],
		muscleGroups: ["biceps"],
	},
	{
		name: "Trizeps-Seilzug",
		aliases: ["Tricep Rope Pushdown", "Trizeps-Druck"],
		muscleGroups: ["triceps"],
	},
	{
		name: "Trizeps-Dips",
		aliases: ["Dips", "Bench Dips"],
		muscleGroups: ["triceps", "chest"],
	},
	{
		name: "Kurzhantel-Trizeps-Drücken",
		aliases: ["Dumbbell Tricep Press"],
		muscleGroups: ["triceps"],
	},
	{
		name: "Trizeps-Kickback",
		aliases: ["Tricep Kickback"],
		muscleGroups: ["triceps"],
	},
	{
		name: "Predigerstuhl-Curl",
		aliases: ["Preacher Curl"],
		muscleGroups: ["biceps"],
	},

	// Isolation — Forearms
	{
		name: "Handgelenk-Curl",
		aliases: ["Wrist Curl"],
		muscleGroups: ["forearms"],
	},
	{
		name: "Reverse Handgelenk-Curl",
		aliases: ["Reverse Wrist Curl"],
		muscleGroups: ["forearms"],
	},
	{
		name: "Farmer's Walk",
		aliases: ["Farmers Walk", "Kofferheben"],
		muscleGroups: ["forearms", "back", "core"],
	},

	// Isolation — Legs
	{
		name: "Beinbeuger",
		aliases: ["Leg Curl", "Leg Curler"],
		muscleGroups: ["hamstrings"],
	},
	{
		name: "Beinstrecker",
		aliases: ["Leg Extension", "Leg Extensor"],
		muscleGroups: ["quadriceps"],
	},
	{
		name: "Adduktor",
		aliases: ["Adductor Machine"],
		muscleGroups: ["glutes", "quadriceps"],
	},
	{
		name: "Abduktor",
		aliases: ["Abductor Machine"],
		muscleGroups: ["glutes"],
	},
	{
		name: "Wadenheben",
		aliases: ["Calf Raise"],
		muscleGroups: ["calves"],
	},
	{
		name: "Sitzend-Wadenheben",
		aliases: ["Seated Calf Raise"],
		muscleGroups: ["calves"],
	},

	// Isolation — Shoulders
	{
		name: "Seitenheben",
		aliases: ["Lateral Raise", "Lateral Lift"],
		muscleGroups: ["shoulders"],
	},
	{
		name: "Kurzhantel-Seitenheben",
		aliases: ["Dumbbell Lateral Raise"],
		muscleGroups: ["shoulders"],
	},
	{
		name: "Vorderheben",
		aliases: ["Front Raise"],
		muscleGroups: ["shoulders"],
	},

	// Core
	{
		name: "Crunches",
		aliases: ["Sit-Ups"],
		muscleGroups: ["core"],
	},
	{
		name: "Planke",
		aliases: ["Plank"],
		muscleGroups: ["core"],
	},
	{
		name: "Beinheben",
		aliases: ["Leg Raises", "Hanging Leg Raises"],
		muscleGroups: ["core"],
	},
	{
		name: "Russian Twist",
		aliases: ["Russische Drehung"],
		muscleGroups: ["core"],
	},
	{
		name: "Ab Wheel Rollout",
		aliases: ["Bauchrad"],
		muscleGroups: ["core"],
	},
];
