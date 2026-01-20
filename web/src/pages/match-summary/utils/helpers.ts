/**
 * Convert complexity to numeric score for comparison
 */
export const getComplexityScore = (complexity: {
	timeComplexity: string;
	spaceComplexity: string;
	confidence: string;
}): number => {
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

/**
 * Format time display
 */
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

/**
 * Get time complexity color class
 */
export const getTimeComplexityColor = (complexity: string): string => {
	switch (complexity) {
		case "O(1)":
		case "O(log n)":
			return "bg-[#6BCB77]/20 text-[#6BCB77]";
		case "O(n)":
		case "O(n log n)":
			return "bg-[#FFD93D]/20 text-[#FFD93D]";
		case "O(n²)":
			return "bg-[#ffa726]/20 text-[#ffa726]";
		default:
			return "bg-[#FF6B6B]/20 text-[#FF6B6B]";
	}
};

/**
 * Get space complexity color class
 */
export const getSpaceComplexityColor = (complexity: string): string => {
	switch (complexity) {
		case "O(1)":
		case "O(log n)":
			return "bg-[#6BCB77]/20 text-[#6BCB77]";
		case "O(n)":
			return "bg-[#FFD93D]/20 text-[#FFD93D]";
		case "O(n²)":
			return "bg-[#ffa726]/20 text-[#ffa726]";
		default:
			return "bg-[#FF6B6B]/20 text-[#FF6B6B]";
	}
};

/**
 * Get complexity bar color for charts
 */
export const getComplexityBarColor = (
	complexity: string,
	isYours: boolean,
): string => {
	if (!isYours) return "bg-gray-600";
	switch (complexity) {
		case "O(1)":
		case "O(log n)":
			return "bg-gradient-to-r from-green-500 to-green-400";
		case "O(n)":
		case "O(n log n)":
			return "bg-gradient-to-r from-yellow-500 to-yellow-400";
		case "O(n²)":
			return "bg-gradient-to-r from-orange-500 to-orange-400";
		default:
			return "bg-gradient-to-r from-red-500 to-red-400";
	}
};

/**
 * Get space complexity bar color for charts
 */
export const getSpaceComplexityBarColor = (
	complexity: string,
	isYours: boolean,
): string => {
	if (!isYours) return "bg-gray-600";
	switch (complexity) {
		case "O(1)":
		case "O(log n)":
			return "bg-gradient-to-r from-green-500 to-green-400";
		case "O(n)":
			return "bg-gradient-to-r from-yellow-500 to-yellow-400";
		case "O(n²)":
			return "bg-gradient-to-r from-orange-500 to-orange-400";
		default:
			return "bg-gradient-to-r from-red-500 to-red-400";
	}
};
