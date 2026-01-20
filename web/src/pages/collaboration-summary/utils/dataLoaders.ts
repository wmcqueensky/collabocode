import { supabase } from "../../../lib/supabase";
import { codeAnalyzerService } from "../../../services/codeAnalyzerService";
import type {
	ComplexityAnalysis,
	PercentileData,
	HistoricalStats,
	DistributionData,
	HistoricalSolution,
} from "./types";
import { getComplexityScore } from "./utils";

/**
 * Load distribution data for comparison charts
 */
export const loadDistributionData = async (
	sessionId: string,
	problemId: string,
	maxPlayers: number,
	_timeLimit: number,
	currentSolveTime: number,
	currentComplexity: ComplexityAnalysis,
	language: string,
): Promise<DistributionData | null> => {
	try {
		const { data: historicalSessions, error } = await supabase
			.from("sessions")
			.select(
				`
				id,
				started_at,
				language,
				session_participants!inner(
					submission_time,
					code_snapshot,
					is_correct
				)
			`,
			)
			.eq("problem_id", problemId)
			.eq("type", "collaboration")
			.eq("status", "completed")
			.gte("max_players", maxPlayers - 1)
			.lte("max_players", maxPlayers + 1)
			.neq("id", sessionId);

		if (error || !historicalSessions) {
			return null;
		}

		const historicalSolutions: HistoricalSolution[] = [];

		for (const session of historicalSessions) {
			const participants = session.session_participants as any[];
			if (!participants || participants.length === 0) continue;

			const wasSuccessful = participants.some((p: any) => p.is_correct);
			if (!wasSuccessful) continue;

			const startTime = session.started_at
				? new Date(session.started_at).getTime()
				: 0;
			const submissions = participants
				.filter((p: any) => p.submission_time)
				.map((p: any) => new Date(p.submission_time).getTime());

			if (submissions.length === 0 || startTime === 0) continue;

			const sessionSolveTime = Math.floor(
				(Math.min(...submissions) - startTime) / 1000,
			);

			const firstSubmitter = participants.find((p: any) => p.code_snapshot);
			const historicalComplexity = codeAnalyzerService.analyzeComplexity(
				firstSubmitter?.code_snapshot || "",
				session.language || language,
			);

			historicalSolutions.push({
				solveTime: sessionSolveTime,
				timeComplexity: historicalComplexity.timeComplexity,
				spaceComplexity: historicalComplexity.spaceComplexity,
				complexityScore: getComplexityScore(historicalComplexity),
			});
		}

		// Create time distribution buckets
		const timeRanges = [
			{ min: 0, max: 60, label: "0-1m" },
			{ min: 60, max: 120, label: "1-2m" },
			{ min: 120, max: 180, label: "2-3m" },
			{ min: 180, max: 300, label: "3-5m" },
			{ min: 300, max: 600, label: "5-10m" },
			{ min: 600, max: 900, label: "10-15m" },
			{ min: 900, max: 1800, label: "15-30m" },
			{ min: 1800, max: Infinity, label: "30m+" },
		];

		const timeDistribution = timeRanges.map((range) => {
			const count = historicalSolutions.filter(
				(s) => s.solveTime >= range.min && s.solveTime < range.max,
			).length;
			const isYours =
				currentSolveTime >= range.min && currentSolveTime < range.max;
			return { range: range.label, count, isYours };
		});

		// Create time complexity distribution
		const timeComplexityTypes = [
			"O(1)",
			"O(log n)",
			"O(n)",
			"O(n log n)",
			"O(n²)",
			"O(n³)",
			"O(2^n)",
			"N/A",
		];
		const complexityDistribution = timeComplexityTypes
			.map((complexity) => {
				const count = historicalSolutions.filter(
					(s) => s.timeComplexity === complexity,
				).length;
				const isYours = currentComplexity.timeComplexity === complexity;
				return { complexity, count, isYours };
			})
			.filter((d) => d.count > 0 || d.isYours);

		// Create space complexity distribution
		const spaceComplexityTypes = [
			"O(1)",
			"O(log n)",
			"O(n)",
			"O(n²)",
			"O(2^n)",
			"N/A",
		];
		const spaceComplexityDistribution = spaceComplexityTypes
			.map((complexity) => {
				const count = historicalSolutions.filter(
					(s) => s.spaceComplexity === complexity,
				).length;
				const isYours = currentComplexity.spaceComplexity === complexity;
				return { complexity, count, isYours };
			})
			.filter((d) => d.count > 0 || d.isYours);

		return {
			timeDistribution,
			complexityDistribution,
			spaceComplexityDistribution,
			historicalSolutions,
		};
	} catch (err) {
		console.error("Error loading distribution data:", err);
		return null;
	}
};

/**
 * Load historical statistics from database
 */
export const loadHistoricalStats = async (
	sessionId: string,
	problemId: string,
	_maxPlayers: number,
	_timeLimit: number,
): Promise<HistoricalStats | null> => {
	try {
		const { data: historicalSessions, error } = await supabase
			.from("sessions")
			.select(
				`
				id,
				started_at,
				ended_at,
				max_players,
				time_limit,
				session_participants!inner(
					submission_time,
					is_correct,
					test_results
				)
			`,
			)
			.eq("problem_id", problemId)
			.eq("type", "collaboration")
			.eq("status", "completed")
			.neq("id", sessionId);

		if (error || !historicalSessions) {
			return null;
		}

		if (historicalSessions.length === 0) {
			return {
				totalCollaborations: 0,
				successRate: 0,
				averageSolveTime: 0,
				averageCorrectness: 0,
			};
		}

		let successfulCount = 0;
		let totalSolveTime = 0;
		let solveTimeCount = 0;
		let totalCorrectness = 0;

		for (const session of historicalSessions) {
			const participants = session.session_participants as any[];
			if (!participants || participants.length === 0) continue;

			const wasSuccessful = participants.some((p: any) => p.is_correct);
			if (wasSuccessful) successfulCount++;

			if (session.started_at) {
				const startTime = new Date(session.started_at).getTime();
				const firstSubmission = participants
					.filter((p: any) => p.submission_time)
					.sort(
						(a: any, b: any) =>
							new Date(a.submission_time).getTime() -
							new Date(b.submission_time).getTime(),
					)[0];

				if (firstSubmission) {
					const solveTime = Math.floor(
						(new Date(firstSubmission.submission_time).getTime() - startTime) /
							1000,
					);
					totalSolveTime += solveTime;
					solveTimeCount++;
				}
			}

			let sessionCorrectness = 0;
			let participantCount = 0;
			for (const p of participants) {
				const testResults = p.test_results || {};
				if (testResults.totalCount > 0) {
					sessionCorrectness +=
						(testResults.passedCount || 0) / testResults.totalCount;
					participantCount++;
				}
			}
			if (participantCount > 0) {
				totalCorrectness += sessionCorrectness / participantCount;
			}
		}

		return {
			totalCollaborations: historicalSessions.length,
			successRate:
				historicalSessions.length > 0
					? (successfulCount / historicalSessions.length) * 100
					: 0,
			averageSolveTime:
				solveTimeCount > 0 ? Math.round(totalSolveTime / solveTimeCount) : 0,
			averageCorrectness:
				historicalSessions.length > 0
					? Math.round((totalCorrectness / historicalSessions.length) * 100)
					: 0,
		};
	} catch (err) {
		console.error("Error loading historical stats:", err);
		return null;
	}
};

/**
 * Calculate percentiles by comparing with all historical data
 */
export const calculatePercentiles = async (
	sessionId: string,
	problemId: string,
	maxPlayers: number,
	timeLimit: number,
	solveTimeSeconds: number,
	complexity: ComplexityAnalysis,
	language: string,
): Promise<PercentileData | null> => {
	try {
		const { data: historicalSessions, error } = await supabase
			.from("sessions")
			.select(
				`
				id,
				started_at,
				language,
				session_participants!inner(
					submission_time,
					code_snapshot,
					is_correct
				)
			`,
			)
			.eq("problem_id", problemId)
			.eq("type", "collaboration")
			.eq("status", "completed")
			.gte("max_players", maxPlayers - 1)
			.lte("max_players", maxPlayers + 1)
			.gte("time_limit", timeLimit - 15)
			.lte("time_limit", timeLimit + 15)
			.neq("id", sessionId);

		if (error || !historicalSessions || historicalSessions.length < 1) {
			return null;
		}

		const historicalMetrics: Array<{
			solveTime: number;
			complexityScore: number;
		}> = [];

		for (const session of historicalSessions) {
			const participants = session.session_participants as any[];
			if (!participants || participants.length === 0) continue;

			const wasSuccessful = participants.some((p: any) => p.is_correct);
			if (!wasSuccessful) continue;

			const startTime = session.started_at
				? new Date(session.started_at).getTime()
				: 0;
			const submissions = participants
				.filter((p: any) => p.submission_time)
				.map((p: any) => new Date(p.submission_time).getTime());

			if (submissions.length === 0 || startTime === 0) continue;

			const sessionSolveTime = Math.floor(
				(Math.min(...submissions) - startTime) / 1000,
			);

			const firstSubmitter = participants.find((p: any) => p.code_snapshot);
			const historicalComplexity = codeAnalyzerService.analyzeComplexity(
				firstSubmitter?.code_snapshot || "",
				session.language || language,
			);

			historicalMetrics.push({
				solveTime: sessionSolveTime,
				complexityScore: getComplexityScore(historicalComplexity),
			});
		}

		if (historicalMetrics.length < 1) {
			return null;
		}

		const currentComplexityScore = getComplexityScore(complexity);

		const fasterThan = historicalMetrics.filter(
			(m) => m.solveTime > solveTimeSeconds,
		).length;
		const timePercentile = Math.round(
			(fasterThan / historicalMetrics.length) * 100,
		);

		const betterComplexityThan = historicalMetrics.filter(
			(m) => m.complexityScore < currentComplexityScore,
		).length;
		const complexityPercentile = Math.round(
			(betterComplexityThan / historicalMetrics.length) * 100,
		);

		const solveTimes = historicalMetrics.map((m) => m.solveTime);
		const averageSolveTime = Math.round(
			solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length,
		);
		const fastestSolveTime = Math.min(...solveTimes);
		const slowestSolveTime = Math.max(...solveTimes);

		return {
			timePercentile,
			complexityPercentile,
			totalComparisons: historicalMetrics.length,
			fasterThan,
			betterComplexityThan,
			averageSolveTime,
			fastestSolveTime,
			slowestSolveTime,
		};
	} catch (err) {
		console.error("Error calculating percentiles:", err);
		return null;
	}
};
