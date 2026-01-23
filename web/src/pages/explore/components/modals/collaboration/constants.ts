import type { ProgrammingLanguage, TimeOption } from "./types";

// Violet accent colors for collaboration theme
export const ACCENT = {
	bg: "bg-[#8b5cf6]",
	bgLight: "bg-[#8b5cf6]/20",
	bgLighter: "bg-[#8b5cf6]/10",
	text: "text-[#a78bfa]",
	border: "border-[#8b5cf6]",
	borderLight: "border-[#8b5cf6]/30",
	ring: "ring-[#8b5cf6]",
	focus: "focus:border-[#8b5cf6] focus:ring-[#8b5cf6]",
	hover: "hover:bg-[#7c3aed]",
} as const;

export const VIOLET_ICON = "text-[#a78bfa]";

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
	if (!difficulty) return "bg-gray-500/20 text-gray-400";
	switch (String(difficulty).toLowerCase()) {
		case "easy":
			return "bg-green-500/20 text-green-400";
		case "medium":
			return "bg-yellow-500/20 text-yellow-400";
		case "hard":
			return "bg-red-500/20 text-red-400";
		default:
			return "bg-gray-500/20 text-gray-400";
	}
};
