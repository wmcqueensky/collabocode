import { supabase } from "../../../lib/supabase";
import { codeAnalyzerService } from "../../../services/codeAnalyzerService";
import type { DistributionData, HistoricalSolution } from "./types";
import { getComplexityScore } from "./helpers";

/**
 * Load distribution data for comparison charts
 */
export const loadDistributionData = async (
	sessionId: string,
	problemId: string,
	currentSolveTime: number,
	currentTimeComplexity: string,
	currentSpaceComplexity: string,
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
					is_correct,
					ranking
				)
			`,
			)
			.eq("problem_id", problemId)
			.eq("type", "match")
			.eq("status", "completed")
			.neq("id", sessionId);

		if (error || !historicalSessions) {
			return null;
		}

		const historicalSolutions: HistoricalSolution[] = [];

		for (const session of historicalSessions) {
			const participants = session.session_participants as any[];
			if (!participants || participants.length === 0) continue;

			// Get the winner's solution for comparison
			const winner = participants.find(
				(p: any) => p.ranking === 1 && p.is_correct,
			);
			if (!winner) continue;

			const startTime = session.started_at
				? new Date(session.started_at).getTime()
				: 0;

			if (!winner.submission_time || startTime === 0) continue;

			const sessionSolveTime = Math.floor(
				(new Date(winner.submission_time).getTime() - startTime) / 1000,
			);

			const historicalComplexity = codeAnalyzerService.analyzeComplexity(
				winner.code_snapshot || "",
				session.language || language,
			);

			historicalSolutions.push({
				solveTime: sessionSolveTime,
				timeComplexity: historicalComplexity.timeComplexity,
				spaceComplexity: historicalComplexity.spaceComplexity,
				complexityScore: getComplexityScore(historicalComplexity),
			});
		}

		if (historicalSolutions.length === 0) {
			return null;
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
				const isYours = currentTimeComplexity === complexity;
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
				const isYours = currentSpaceComplexity === complexity;
				return { complexity, count, isYours };
			})
			.filter((d) => d.count > 0 || d.isYours);

		// Calculate percentiles
		const fasterThan = historicalSolutions.filter(
			(s) => s.solveTime > currentSolveTime,
		).length;
		const timePercentile = Math.round(
			(fasterThan / historicalSolutions.length) * 100,
		);

		const currentComplexityScore = getComplexityScore({
			timeComplexity: currentTimeComplexity,
			spaceComplexity: currentSpaceComplexity,
			confidence: "high",
		});
		const betterComplexityThan = historicalSolutions.filter(
			(s) => s.complexityScore < currentComplexityScore,
		).length;
		const complexityPercentile = Math.round(
			(betterComplexityThan / historicalSolutions.length) * 100,
		);

		const solveTimes = historicalSolutions.map((s) => s.solveTime);
		const averageSolveTime = Math.round(
			solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length,
		);
		const fastestSolveTime = Math.min(...solveTimes);

		return {
			timeDistribution,
			complexityDistribution,
			spaceComplexityDistribution,
			historicalSolutions,
			totalComparisons: historicalSolutions.length,
			timePercentile,
			complexityPercentile,
			averageSolveTime,
			fastestSolveTime,
		};
	} catch (err) {
		console.error("Error loading distribution data:", err);
		return null;
	}
};
