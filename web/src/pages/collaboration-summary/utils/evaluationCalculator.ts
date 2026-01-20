import { codeAnalyzerService } from "../../../services/codeAnalyzerService";
import type { HistoricalStats, TeamEvaluation } from "./types";
import {
	calculateEfficiencyScore,
	calculateCodeQualityScore,
	calculateCollaborationScore,
	calculateOverallScore,
} from "./scoreCalculations";
import {
	generateDynamicFeedback,
	generateDynamicStrengths,
	generateDynamicImprovements,
} from "./feedbackGenerators";
import { calculatePercentiles } from "./dataLoaders";

/**
 * Calculate team evaluation with complexity analysis and percentiles
 */
export const calculateTeamEvaluation = async (
	sessionId: string,
	participants: any[],
	session: any,
	code: string,
	stats: HistoricalStats | null,
): Promise<TeamEvaluation> => {
	let totalPassed = 0;
	let totalTests = 0;
	participants.forEach((p) => {
		const results = p.test_results || {};
		totalPassed += results.passedCount || 0;
		totalTests += results.totalCount || 0;
	});

	const isCorrect = participants.some((p) => p.is_correct);

	const correctness =
		totalTests > 0
			? Math.round(((totalPassed / totalTests) * 100) / participants.length)
			: 0;

	const startTime = session.started_at
		? new Date(session.started_at).getTime()
		: 0;
	const submissions = participants
		.filter((p) => p.submission_time)
		.map((p) => new Date(p.submission_time).getTime());

	const firstSubmissionTime =
		submissions.length > 0 ? Math.min(...submissions) : Date.now();
	const solveTimeSeconds =
		startTime > 0 ? Math.floor((firstSubmissionTime - startTime) / 1000) : 0;

	const complexity = codeAnalyzerService.analyzeComplexity(
		code,
		session.language,
	);

	const percentiles = await calculatePercentiles(
		sessionId,
		session.problem_id,
		session.max_players,
		session.time_limit,
		solveTimeSeconds,
		complexity,
		session.language,
	);

	const efficiency = calculateEfficiencyScore(complexity);
	const codeQuality = calculateCodeQualityScore(code, session.language);
	const collaboration = calculateCollaborationScore(participants, session);

	const overallScore = calculateOverallScore(
		correctness,
		efficiency,
		codeQuality,
		collaboration,
		isCorrect,
	);

	const feedback = generateDynamicFeedback(
		correctness,
		efficiency,
		codeQuality,
		collaboration,
		complexity,
		percentiles,
		stats,
		isCorrect,
	);

	const strengths = generateDynamicStrengths(
		correctness,
		efficiency,
		codeQuality,
		collaboration,
		complexity,
		percentiles,
		stats,
	);

	const improvements = generateDynamicImprovements(
		correctness,
		efficiency,
		codeQuality,
		collaboration,
		complexity,
		percentiles,
		stats,
	);

	return {
		overallScore,
		correctness,
		efficiency,
		codeQuality,
		collaboration,
		solveTimeSeconds,
		complexity,
		percentiles,
		feedback,
		strengths,
		improvements,
		isCorrect,
	};
};
