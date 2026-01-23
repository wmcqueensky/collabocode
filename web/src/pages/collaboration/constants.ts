import type { OutputMessage } from "./types";

// Default console output
export const DEFAULT_OUTPUT: OutputMessage[] = [
	{ message: "// Console output will appear here", status: "normal" },
];

// Timer constants
export const LOW_TIME_THRESHOLD = 300; // 5 minutes in seconds

// Redirect countdown after submission
export const SUBMISSION_REDIRECT_COUNTDOWN = 3;

// Mobile breakpoint
export const MOBILE_BREAKPOINT = 768;

// Language file extensions
export const LANGUAGE_EXTENSIONS: Record<string, string> = {
	javascript: "js",
	typescript: "ts",
	python: "py",
	java: "java",
	cpp: "cpp",
	c: "c",
	csharp: "cs",
	go: "go",
	ruby: "rb",
	php: "php",
	swift: "swift",
	kotlin: "kt",
	rust: "rs",
};

// Get file extension for language
export const getFileExtension = (language: string): string => {
	return LANGUAGE_EXTENSIONS[language] || "js";
};

// Avatar colors for collaborators
export const AVATAR_COLORS = [
	"bg-[#FF6B6B]",
	"bg-[#FFD93D]",
	"bg-[#6BCB77]",
	"bg-[#e44dff]",
	"bg-[#5bc6ca]",
	"bg-[#FF8E53]",
];

// Colors with light text
export const LIGHT_BG_INDICES = [1, 2];

// Get avatar color by index
export const getAvatarColor = (index: number): string => {
	return AVATAR_COLORS[index % AVATAR_COLORS.length];
};

// Get text color for avatar background
export const getAvatarTextColor = (index: number): string => {
	return LIGHT_BG_INDICES.includes(index % AVATAR_COLORS.length)
		? "text-gray-900"
		: "text-white";
};
