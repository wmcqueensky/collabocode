import type { ProgrammingLanguage, TimeOption } from "./types";

export const ACCENT = {
	bg: "bg-purple-600",
	bgLight: "bg-purple-100",
	bgLighter: "bg-purple-50",
	text: "text-purple-600",
	border: "border-purple-600",
	borderLight: "border-purple-200",
	ring: "ring-purple-600",
	focus: "focus:border-purple-600 focus:ring-purple-600",
	hover: "hover:bg-purple-700",
} as const;

export const VIOLET_ICON = "text-purple-600";

export const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "python", label: "Python" },
];

export const TIME_OPTIONS: TimeOption[] = [
	{ value: 3, label: "3 min" },
	{ value: 5, label: "5 min" },
	{ value: 10, label: "10 min" },
	{ value: 15, label: "15 min" },
	{ value: 30, label: "30 min" },
	{ value: 60, label: "60 min" },
];

export const TEAM_SIZES = [2, 3, 4];

export const DEFAULT_LANGUAGE = "javascript";
export const DEFAULT_TIME_LIMIT = 30;
export const DEFAULT_PLAYER_COUNT = 2;

export const getLanguageDisplayName = (languageId: string): string => {
	const language = PROGRAMMING_LANGUAGES.find((l) => l.value === languageId);
	return language?.label || languageId;
};

export const getTeamSizeLabel = (count: number): string => {
	switch (count) {
		case 2:
			return "Pair";
		case 3:
			return "Trio";
		case 4:
			return "Squad";
		default:
			return `${count} players`;
	}
};

export const getDifficultyColor = (
	difficulty: string | null | undefined,
): string => {
	if (!difficulty) return "bg-gray-100 text-gray-600";
	switch (String(difficulty).toLowerCase()) {
		case "easy":
			return "bg-green-100 text-green-700";
		case "medium":
			return "bg-yellow-100 text-yellow-700";
		case "hard":
			return "bg-red-100 text-red-700";
		default:
			return "bg-gray-100 text-gray-600";
	}
};
