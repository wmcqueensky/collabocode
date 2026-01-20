import type {
	ComplexityAnalysis,
	PercentileData,
	HistoricalStats,
} from "./types";

/**
 * Generate dynamic feedback based on all metrics
 */
export const generateDynamicFeedback = (
	correctness: number,
	_efficiency: number,
	_codeQuality: number,
	_collaboration: number,
	complexity: ComplexityAnalysis,
	percentiles: PercentileData | null,
	stats: HistoricalStats | null,
	isCorrect: boolean,
): string[] => {
	const feedback: string[] = [];

	if (isCorrect) {
		feedback.push("Your team successfully solved the problem!");
	} else if (correctness >= 80) {
		feedback.push(
			`Almost there! Your solution passes ${correctness}% of test cases.`,
		);
	} else if (correctness >= 50) {
		feedback.push(
			`Your solution passes ${correctness}% of test cases. Review the failing cases for edge conditions.`,
		);
	} else {
		feedback.push(
			`Your solution needs work - only ${correctness}% of tests pass. Consider a different approach.`,
		);
	}

	if (complexity.confidence !== "none") {
		feedback.push(
			`Your solution has ${complexity.timeComplexity} time complexity and ${complexity.spaceComplexity} space complexity.`,
		);
	}

	if (percentiles) {
		if (percentiles.timePercentile >= 75) {
			feedback.push(
				`Excellent speed! Your team solved this faster than ${percentiles.timePercentile}% of other teams.`,
			);
		} else if (percentiles.timePercentile >= 50) {
			feedback.push(
				`Good pace - you were faster than ${percentiles.timePercentile}% of teams.`,
			);
		}
	}

	if (stats && stats.totalCollaborations > 0) {
		feedback.push(
			`This problem has been attempted by ${
				stats.totalCollaborations
			} other teams with a ${stats.successRate.toFixed(0)}% success rate.`,
		);
	}

	return feedback;
};

/**
 * Generate dynamic strengths based on metrics
 */
export const generateDynamicStrengths = (
	correctness: number,
	efficiency: number,
	codeQuality: number,
	collaboration: number,
	complexity: ComplexityAnalysis,
	percentiles: PercentileData | null,
	stats: HistoricalStats | null,
): string[] => {
	const strengths: string[] = [];

	if (correctness >= 80) {
		strengths.push(`High test pass rate (${correctness}%)`);
	}

	if (efficiency >= 80) {
		strengths.push(`Efficient ${complexity.timeComplexity} algorithm`);
	} else if (efficiency >= 60 && complexity.timeComplexity !== "N/A") {
		strengths.push(`Reasonable ${complexity.timeComplexity} time complexity`);
	}

	if (codeQuality >= 80) {
		strengths.push("Well-structured, readable code");
	} else if (codeQuality >= 65) {
		strengths.push("Code has good formatting and structure");
	}

	if (collaboration >= 80) {
		strengths.push("Excellent team coordination");
	} else if (collaboration >= 60) {
		strengths.push("Good team participation");
	}

	if (percentiles) {
		if (percentiles.timePercentile >= 75) {
			strengths.push(`Top ${100 - percentiles.timePercentile}% in solve time`);
		}
		if (percentiles.complexityPercentile >= 75) {
			strengths.push(
				`Top ${100 - percentiles.complexityPercentile}% in algorithm efficiency`,
			);
		}
	}

	if (stats && stats.successRate > 0 && correctness === 100) {
		if (stats.successRate < 50) {
			strengths.push("Solved a challenging problem (< 50% success rate)");
		}
	}

	if (strengths.length === 0) {
		strengths.push("Team completed the challenge together");
	}

	return strengths;
};

/**
 * Generate dynamic improvements based on metrics
 */
export const generateDynamicImprovements = (
	correctness: number,
	efficiency: number,
	codeQuality: number,
	collaboration: number,
	complexity: ComplexityAnalysis,
	percentiles: PercentileData | null,
	_stats: HistoricalStats | null,
): string[] => {
	const improvements: string[] = [];

	if (correctness < 100) {
		if (correctness < 50) {
			improvements.push("Consider a different algorithmic approach");
		} else {
			improvements.push("Review edge cases and boundary conditions");
		}
	}

	if (
		complexity.timeComplexity === "O(n²)" ||
		complexity.timeComplexity === "O(2^n)"
	) {
		improvements.push(
			`Consider optimizing from ${complexity.timeComplexity} to O(n log n) or O(n)`,
		);
	}

	if (complexity.spaceComplexity === "O(n)" && efficiency < 70) {
		improvements.push("Try to reduce space complexity if possible");
	}

	if (codeQuality < 60) {
		improvements.push("Add comments to explain complex logic");
		improvements.push("Use more descriptive variable names");
	} else if (codeQuality < 80) {
		improvements.push("Consider adding inline comments for clarity");
	}

	if (collaboration < 60) {
		improvements.push("Ensure all team members actively participate");
	}

	if (percentiles) {
		if (percentiles.timePercentile < 50 && percentiles.averageSolveTime > 0) {
			const avgMins = Math.floor(percentiles.averageSolveTime / 60);
			improvements.push(
				`Average solve time is ${avgMins}m - practice to improve speed`,
			);
		}
	}

	if (improvements.length === 0) {
		improvements.push("Keep practicing with harder problems!");
	}

	return improvements;
};
