export interface TeamMember {
	id: string;
	name: string;
	avatar: string | null;
	passedTests: number;
	totalTests: number;
	submissionTime: string | null;
	submissionTimeMs: number | null;
	ratingBefore: number;
	ratingChange: number;
}

export interface ComplexityAnalysis {
	timeComplexity: string;
	spaceComplexity: string;
	confidence: "high" | "medium" | "low" | "none";
}

export interface PercentileData {
	timePercentile: number;
	complexityPercentile: number;
	totalComparisons: number;
	fasterThan: number;
	betterComplexityThan: number;
	averageSolveTime: number;
	fastestSolveTime: number;
	slowestSolveTime: number;
}

export interface HistoricalSolution {
	solveTime: number;
	timeComplexity: string;
	spaceComplexity: string;
	complexityScore: number;
}

export interface TeamEvaluation {
	overallScore: number;
	correctness: number;
	efficiency: number;
	codeQuality: number;
	collaboration: number;
	solveTimeSeconds: number;
	complexity: ComplexityAnalysis;
	percentiles: PercentileData | null;
	feedback: string[];
	strengths: string[];
	improvements: string[];
	isCorrect: boolean;
}

export interface HistoricalStats {
	totalCollaborations: number;
	successRate: number;
	averageSolveTime: number;
	averageCorrectness: number;
}

export interface DistributionData {
	timeDistribution: { range: string; count: number; isYours: boolean }[];
	complexityDistribution: {
		complexity: string;
		count: number;
		isYours: boolean;
	}[];
	spaceComplexityDistribution: {
		complexity: string;
		count: number;
		isYours: boolean;
	}[];
	historicalSolutions: HistoricalSolution[];
}
