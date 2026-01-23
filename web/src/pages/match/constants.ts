// Match page accent colors (teal theme)
export const ACCENT = {
	bg: "bg-[#5bc6ca]",
	bgHover: "hover:bg-[#48aeb3]",
	bgLight: "bg-[#5bc6ca]/10",
	bgDark: "bg-[#2a5a5c]",
	bgDarkHover: "hover:bg-[#39767a]",
	text: "text-[#5bc6ca]",
	border: "border-[#5bc6ca]",
	ring: "ring-[#5bc6ca]",
	focus: "focus:ring-[#5bc6ca]",
} as const;

// Default output message
export const DEFAULT_OUTPUT: { message: string; status: string }[] = [
	{ message: "// Console output will appear here", status: "normal" },
];

// Language file extensions
export const LANGUAGE_EXTENSIONS: Record<string, string> = {
	javascript: "js",
	typescript: "ts",
	python: "py",
	java: "java",
	cpp: "cpp",
	csharp: "cs",
	go: "go",
	ruby: "rb",
	php: "php",
	swift: "swift",
	kotlin: "kt",
	rust: "rs",
};

/**
 * Get file extension for a given language
 */
export const getFileExtension = (language: string): string => {
	return LANGUAGE_EXTENSIONS[language] || language;
};

/**
 * Format seconds to MM:SS string
 */
export const formatTime = (totalSeconds: number): string => {
	const minutes = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Format activity timestamp relative to now
 */
export const formatActivityTimestamp = (createdAt: string): string => {
	const time = new Date(createdAt);
	const now = new Date();
	const diffMs = now.getTime() - time.getTime();
	const diffMins = Math.floor(diffMs / 60000);

	if (diffMins < 1) {
		return "now";
	} else if (diffMins < 60) {
		return `${diffMins}m ago`;
	} else {
		return time.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}
};

/**
 * Get difficulty color classes
 */
export const getDifficultyColor = (difficulty: string): string => {
	switch (difficulty.toLowerCase()) {
		case "easy":
			return "bg-green-900/30 text-green-400";
		case "medium":
			return "bg-yellow-900/30 text-yellow-400";
		case "hard":
			return "bg-red-900/30 text-red-400";
		default:
			return "bg-gray-700 text-gray-300";
	}
};

/**
 * Calculate participant progress based on test results
 */
export const calculateProgress = (
	isCorrect: boolean,
	passedCount: number,
	totalCount: number,
): number => {
	if (isCorrect) {
		return 100;
	}
	if (totalCount > 0) {
		return (passedCount / totalCount) * 100;
	}
	return 0;
};
