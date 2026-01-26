import type { ComplexityAnalysis } from "./types";

export const formatTime = (seconds: number): string => {
	if (seconds < 60) return `${seconds}s`;
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	if (mins >= 60) {
		const hours = Math.floor(mins / 60);
		const remainingMins = mins % 60;
		return `${hours}h ${remainingMins}m`;
	}
	return `${mins}m ${secs}s`;
};

export const getMonacoLanguage = (language: string): string => {
	const languageMap: Record<string, string> = {
		javascript: "javascript",
		typescript: "typescript",
		python: "python",
		java: "java",
		cpp: "cpp",
		c: "c",
		csharp: "csharp",
		go: "go",
		ruby: "ruby",
		php: "php",
		swift: "swift",
		kotlin: "kotlin",
		rust: "rust",
	};
	return languageMap[language?.toLowerCase()] || "javascript";
};

export const getRatingChangeColor = (change: number): string => {
	if (change > 0) return "text-green-600";
	if (change < 0) return "text-red-600";
	return "text-gray-500";
};

export const getComplexityScore = (complexity: ComplexityAnalysis): number => {
	const timeScores: Record<string, number> = {
		"O(1)": 100,
		"O(log n)": 90,
		"O(n)": 80,
		"O(n log n)": 70,
		"O(n²)": 50,
		"O(n³)": 30,
		"O(2^n)": 20,
		"O(n!)": 10,
		"N/A": 0,
	};

	const spaceScores: Record<string, number> = {
		"O(1)": 100,
		"O(log n)": 90,
		"O(n)": 70,
		"O(n²)": 40,
		"O(2^n)": 20,
		"N/A": 0,
	};

	const timeScore = timeScores[complexity.timeComplexity] || 50;
	const spaceScore = spaceScores[complexity.spaceComplexity] || 50;

	return Math.round(timeScore * 0.7 + spaceScore * 0.3);
};
