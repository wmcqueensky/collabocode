export interface HistoricalSolution {
	solveTime: number;
	timeComplexity: string;
	spaceComplexity: string;
	complexityScore: number;
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
	totalComparisons: number;
	timePercentile: number;
	complexityPercentile: number;
	averageSolveTime: number;
	fastestSolveTime: number;
}

export interface PlayerData {
	userId: string;
	name: string;
	rank: number;
	initial: string;
	textColor: string;
	bgColor: string;
	formattedTime: string;
	timeToSolve: number;
	passedTestCases: number;
	passedTestCount: number;
	totalTestCount: number;
	timeComplexity: string;
	spaceComplexity: string;
	previousRating: number;
	currentRating: number;
	ratingChange: number;
	isCorrect: boolean;
	codeQualityScore: number;
}

export interface SummaryData {
	problemName: string;
	difficulty: string;
	totalParticipants: number;
	winner: string;
	winnerTime: string;
	players: PlayerData[];
}
