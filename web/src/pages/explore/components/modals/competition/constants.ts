import type { ProgrammingLanguage } from "./types";

export const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
	{ id: "javascript", name: "JavaScript" },
	{ id: "python", name: "Python" },
	{ id: "java", name: "Java" },
	{ id: "cpp", name: "C++" },
	{ id: "csharp", name: "C#" },
	{ id: "go", name: "Go" },
	{ id: "ruby", name: "Ruby" },
	{ id: "typescript", name: "TypeScript" },
	{ id: "php", name: "PHP" },
	{ id: "swift", name: "Swift" },
	{ id: "kotlin", name: "Kotlin" },
	{ id: "rust", name: "Rust" },
];

export const AVAILABLE_TIME_LIMITS = [3, 5, 10, 15, 30, 60];

export const AVAILABLE_PLAYER_COUNTS = [2, 3, 4];

export const DEFAULT_LANGUAGE = "javascript";
export const DEFAULT_TIME_LIMIT = 30;
export const DEFAULT_PLAYER_COUNT = 2;

export const getLanguageDisplayName = (languageId: string): string => {
	const language = PROGRAMMING_LANGUAGES.find((l) => l.id === languageId);
	return language?.name || languageId;
};

export const getDifficultyColor = (
	difficulty: string | null | undefined,
): string => {
	if (!difficulty) return "text-gray-500";
	switch (String(difficulty).toLowerCase()) {
		case "easy":
			return "text-green-500";
		case "medium":
			return "text-yellow-500";
		case "hard":
			return "text-red-500";
		default:
			return "text-gray-500";
	}
};

export const getDifficultyBadgeColor = (difficulty: string): string => {
	switch ((difficulty || "").toLowerCase()) {
		case "easy":
			return "bg-green-600 text-white";
		case "medium":
			return "bg-yellow-600 text-white";
		case "hard":
			return "bg-red-600 text-white";
		default:
			return "bg-gray-600 text-white";
	}
};
