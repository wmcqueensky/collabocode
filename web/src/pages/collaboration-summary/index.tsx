import { useState, useEffect } from "react";
import {
	ArrowLeft,
	CheckCircle,
	XCircle,
	Clock,
	Code,
	Users,
	AlertTriangle,
	Loader2,
	Rocket,
	Star,
	TrendingUp,
	TrendingDown,
	Lightbulb,
	Award,
	Zap,
	Timer,
	BarChart3,
	Trophy,
	Target,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { sessionService } from "../../services/sessionService";
import { codeAnalyzerService } from "../../services/codeAnalyzerService";
import { supabase } from "../../lib/supabase";

interface TeamMember {
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

interface ComplexityAnalysis {
	timeComplexity: string;
	spaceComplexity: string;
	confidence: "high" | "medium" | "low" | "none";
}

interface PercentileData {
	timePercentile: number;
	complexityPercentile: number;
	totalComparisons: number;
	fasterThan: number;
	betterComplexityThan: number;
	averageSolveTime: number;
	fastestSolveTime: number;
	slowestSolveTime: number;
}

interface HistoricalSolution {
	solveTime: number;
	timeComplexity: string;
	spaceComplexity: string;
	complexityScore: number;
}

interface TeamEvaluation {
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

interface HistoricalStats {
	totalCollaborations: number;
	successRate: number;
	averageSolveTime: number;
	averageCorrectness: number;
}

interface DistributionData {
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

export default function CollaborationSummaryPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [session, setSession] = useState<any>(null);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [teamEvaluation, setTeamEvaluation] = useState<TeamEvaluation | null>(
		null
	);
	const [sharedCode, setSharedCode] = useState<string>("");
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [historicalStats, setHistoricalStats] =
		useState<HistoricalStats | null>(null);
	const [distributionData, setDistributionData] =
		useState<DistributionData | null>(null);

	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setCurrentUserId(user.id);
			}
		};
		loadUser();
	}, []);

	useEffect(() => {
		if (!sessionId) {
			navigate("/explore");
			return;
		}
		loadCollaborationSummary();
	}, [sessionId]);

	const loadCollaborationSummary = async () => {
		try {
			setLoading(true);
			setError(null);

			// Load session
			const sessionData = await sessionService.getSessionById(sessionId!);
			if (!sessionData) {
				setError("Session not found");
				return;
			}

			// Redirect if wrong session type
			if (sessionData.type !== "collaboration") {
				navigate(`/match-summary/${sessionId}`);
				return;
			}

			// Check if session is completed
			if (sessionData.status !== "completed") {
				setError(
					"This collaboration is still in progress. You'll be notified when it's complete."
				);
				return;
			}

			setSession(sessionData);

			// Load participants with their profiles
			const { data: participants, error: participantsError } = await supabase
				.from("session_participants")
				.select(`*, user:profiles(*)`)
				.eq("session_id", sessionId)
				.eq("status", "joined");

			if (participantsError) throw participantsError;

			// Get rating changes from session_history
			const { data: historyRecords } = await supabase
				.from("session_history")
				.select("user_id, rating_change")
				.eq("session_id", sessionId)
				.eq("type", "collaboration");

			const ratingChangeMap = new Map<string, number>();
			historyRecords?.forEach((record) => {
				ratingChangeMap.set(record.user_id, record.rating_change || 0);
			});

			// Map to team members
			const members: TeamMember[] = (participants || []).map((p: any) => {
				const testResults = p.test_results || {};
				const submissionTimeMs = p.submission_time
					? new Date(p.submission_time).getTime()
					: null;
				return {
					id: p.user_id,
					name: p.user?.username || "Unknown",
					avatar: p.user?.avatar_url,
					passedTests: testResults.passedCount || 0,
					totalTests: testResults.totalCount || 0,
					submissionTime: p.submission_time
						? new Date(p.submission_time).toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
						  })
						: null,
					submissionTimeMs,
					ratingBefore:
						(p.user?.collaboration_rating || 1000) -
						(ratingChangeMap.get(p.user_id) || 0),
					ratingChange: ratingChangeMap.get(p.user_id) || 0,
				};
			});

			setTeamMembers(members);

			// Get the shared code (use first participant's code snapshot)
			const codeSnapshot = participants?.[0]?.code_snapshot || "";
			setSharedCode(codeSnapshot);

			// Load historical stats for this problem
			const stats = await loadHistoricalStats(
				sessionData.problem_id,
				sessionData.max_players,
				sessionData.time_limit
			);
			setHistoricalStats(stats);

			// Calculate team evaluation with all dynamic data
			const evaluation = await calculateTeamEvaluation(
				participants || [],
				sessionData,
				codeSnapshot,
				stats
			);
			setTeamEvaluation(evaluation);

			// Load distribution data for comparison charts
			const distribution = await loadDistributionData(
				sessionData.problem_id,
				sessionData.max_players,
				sessionData.time_limit,
				evaluation.solveTimeSeconds,
				evaluation.complexity,
				sessionData.language
			);
			setDistributionData(distribution);
		} catch (err: any) {
			console.error("Error loading collaboration summary:", err);
			setError("Failed to load collaboration summary");
		} finally {
			setLoading(false);
		}
	};

	// Load distribution data for comparison charts
	const loadDistributionData = async (
		problemId: string,
		maxPlayers: number,
		timeLimit: number,
		currentSolveTime: number,
		currentComplexity: ComplexityAnalysis,
		language: string
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
				`
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
					(Math.min(...submissions) - startTime) / 1000
				);

				const firstSubmitter = participants.find((p: any) => p.code_snapshot);
				const historicalComplexity = codeAnalyzerService.analyzeComplexity(
					firstSubmitter?.code_snapshot || "",
					session.language || language
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
					(s) => s.solveTime >= range.min && s.solveTime < range.max
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
						(s) => s.timeComplexity === complexity
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
						(s) => s.spaceComplexity === complexity
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

	// Load historical statistics from database
	const loadHistoricalStats = async (
		problemId: string,
		maxPlayers: number,
		timeLimit: number
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
				`
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
								new Date(b.submission_time).getTime()
						)[0];

					if (firstSubmission) {
						const solveTime = Math.floor(
							(new Date(firstSubmission.submission_time).getTime() -
								startTime) /
								1000
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

	// Calculate team evaluation with complexity analysis and percentiles
	const calculateTeamEvaluation = async (
		participants: any[],
		session: any,
		code: string,
		stats: HistoricalStats | null
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
			session.language
		);

		const percentiles = await calculatePercentiles(
			session.problem_id,
			session.max_players,
			session.time_limit,
			solveTimeSeconds,
			complexity,
			session.language
		);

		const efficiency = calculateEfficiencyScore(complexity);
		const codeQuality = calculateCodeQualityScore(code, session.language);
		const collaboration = calculateCollaborationScore(participants, session);

		const overallScore = calculateOverallScore(
			correctness,
			efficiency,
			codeQuality,
			collaboration,
			isCorrect
		);

		const feedback = generateDynamicFeedback(
			correctness,
			efficiency,
			codeQuality,
			collaboration,
			complexity,
			percentiles,
			stats,
			isCorrect
		);

		const strengths = generateDynamicStrengths(
			correctness,
			efficiency,
			codeQuality,
			collaboration,
			complexity,
			percentiles,
			stats
		);

		const improvements = generateDynamicImprovements(
			correctness,
			efficiency,
			codeQuality,
			collaboration,
			complexity,
			percentiles,
			stats
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

	// Calculate percentiles by comparing with all historical data
	const calculatePercentiles = async (
		problemId: string,
		maxPlayers: number,
		timeLimit: number,
		solveTimeSeconds: number,
		complexity: ComplexityAnalysis,
		language: string
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
				`
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
					(Math.min(...submissions) - startTime) / 1000
				);

				const firstSubmitter = participants.find((p: any) => p.code_snapshot);
				const historicalComplexity = codeAnalyzerService.analyzeComplexity(
					firstSubmitter?.code_snapshot || "",
					session.language || language
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
				(m) => m.solveTime > solveTimeSeconds
			).length;
			const timePercentile = Math.round(
				(fasterThan / historicalMetrics.length) * 100
			);

			const betterComplexityThan = historicalMetrics.filter(
				(m) => m.complexityScore < currentComplexityScore
			).length;
			const complexityPercentile = Math.round(
				(betterComplexityThan / historicalMetrics.length) * 100
			);

			const solveTimes = historicalMetrics.map((m) => m.solveTime);
			const averageSolveTime = Math.round(
				solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length
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

	// Convert complexity to numeric score for comparison
	const getComplexityScore = (complexity: ComplexityAnalysis): number => {
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

	// Calculate efficiency score from complexity analysis
	const calculateEfficiencyScore = (complexity: ComplexityAnalysis): number => {
		if (complexity.confidence === "none") {
			return 50;
		}
		return getComplexityScore(complexity);
	};

	// Calculate code quality score from actual code analysis
	const calculateCodeQualityScore = (
		code: string,
		language: string
	): number => {
		if (!code || code.trim().length === 0) return 0;

		let score = 50;
		const lines = code.split("\n");
		const nonEmptyLines = lines.filter((l) => l.trim().length > 0);

		const hasComments =
			language === "python"
				? code.includes("#") || code.includes('"""') || code.includes("'''")
				: code.includes("//") || code.includes("/*");
		if (hasComments) score += 15;

		const varPattern =
			language === "python"
				? /(?:^|\s)(\w+)\s*=/gm
				: /(?:let|const|var)\s+(\w+)/g;
		const matches = [...code.matchAll(varPattern)];
		if (matches.length > 0) {
			const avgLength =
				matches.reduce((sum, m) => sum + (m[1]?.length || 0), 0) /
				matches.length;
			if (avgLength > 5) score += 15;
			else if (avgLength > 3) score += 8;
		}

		const hasIndentation = nonEmptyLines.some(
			(l) => l.startsWith("  ") || l.startsWith("\t")
		);
		if (hasIndentation) score += 10;

		if (nonEmptyLines.length >= 5 && nonEmptyLines.length <= 100) score += 5;

		const hasFunctions =
			language === "python"
				? /def\s+\w+\s*\(/.test(code)
				: /function\s+\w+\s*\(|const\s+\w+\s*=\s*(?:async\s*)?\(/.test(code);
		if (hasFunctions) score += 5;

		return Math.min(100, Math.max(0, score));
	};

	// Calculate collaboration score from actual participation metrics
	const calculateCollaborationScore = (
		participants: any[],
		session: any
	): number => {
		if (participants.length === 0) return 0;

		let score = 0;
		const totalParticipants = participants.length;

		const submittedCount = participants.filter((p) => p.submission_time).length;
		const submissionRate = submittedCount / totalParticipants;
		score += submissionRate * 40;

		const submissions = participants
			.filter((p) => p.submission_time)
			.map((p) => new Date(p.submission_time).getTime());

		if (submissions.length >= 2) {
			const minTime = Math.min(...submissions);
			const maxTime = Math.max(...submissions);
			const spreadMs = maxTime - minTime;
			const spreadMinutes = spreadMs / (1000 * 60);

			if (spreadMinutes < 5) score += 30;
			else if (spreadMinutes < 15) score += 20;
			else if (spreadMinutes < 30) score += 10;
		} else if (submissions.length === 1) {
			score += 15;
		}

		const expectedPlayers = session.max_players || 2;
		const utilizationRate = totalParticipants / expectedPlayers;
		score += utilizationRate * 30;

		return Math.min(100, Math.max(0, Math.round(score)));
	};

	// Calculate overall score with dynamic weighting
	const calculateOverallScore = (
		correctness: number,
		efficiency: number,
		codeQuality: number,
		collaboration: number,
		isCorrect: boolean
	): number => {
		const correctnessWeight = isCorrect ? 0.4 : 0.5;
		const efficiencyWeight = isCorrect ? 0.25 : 0.15;
		const qualityWeight = 0.15;
		const collaborationWeight = isCorrect ? 0.2 : 0.2;

		return Math.round(
			correctness * correctnessWeight +
				efficiency * efficiencyWeight +
				codeQuality * qualityWeight +
				collaboration * collaborationWeight
		);
	};

	// Generate dynamic feedback based on all metrics
	const generateDynamicFeedback = (
		correctness: number,
		efficiency: number,
		codeQuality: number,
		collaboration: number,
		complexity: ComplexityAnalysis,
		percentiles: PercentileData | null,
		stats: HistoricalStats | null,
		isCorrect: boolean
	): string[] => {
		const feedback: string[] = [];

		if (isCorrect) {
			feedback.push("Your team successfully solved the problem!");
		} else if (correctness >= 80) {
			feedback.push(
				`Almost there! Your solution passes ${correctness}% of test cases.`
			);
		} else if (correctness >= 50) {
			feedback.push(
				`Your solution passes ${correctness}% of test cases. Review the failing cases for edge conditions.`
			);
		} else {
			feedback.push(
				`Your solution needs work - only ${correctness}% of tests pass. Consider a different approach.`
			);
		}

		if (complexity.confidence !== "none") {
			feedback.push(
				`Your solution has ${complexity.timeComplexity} time complexity and ${complexity.spaceComplexity} space complexity.`
			);
		}

		if (percentiles) {
			if (percentiles.timePercentile >= 75) {
				feedback.push(
					`Excellent speed! Your team solved this faster than ${percentiles.timePercentile}% of other teams.`
				);
			} else if (percentiles.timePercentile >= 50) {
				feedback.push(
					`Good pace - you were faster than ${percentiles.timePercentile}% of teams.`
				);
			}
		}

		if (stats && stats.totalCollaborations > 0) {
			feedback.push(
				`This problem has been attempted by ${
					stats.totalCollaborations
				} other teams with a ${stats.successRate.toFixed(0)}% success rate.`
			);
		}

		return feedback;
	};

	// Generate dynamic strengths based on metrics
	const generateDynamicStrengths = (
		correctness: number,
		efficiency: number,
		codeQuality: number,
		collaboration: number,
		complexity: ComplexityAnalysis,
		percentiles: PercentileData | null,
		stats: HistoricalStats | null
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
				strengths.push(
					`Top ${100 - percentiles.timePercentile}% in solve time`
				);
			}
			if (percentiles.complexityPercentile >= 75) {
				strengths.push(
					`Top ${
						100 - percentiles.complexityPercentile
					}% in algorithm efficiency`
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

	// Generate dynamic improvements based on metrics
	const generateDynamicImprovements = (
		correctness: number,
		efficiency: number,
		codeQuality: number,
		collaboration: number,
		complexity: ComplexityAnalysis,
		percentiles: PercentileData | null,
		stats: HistoricalStats | null
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
				`Consider optimizing from ${complexity.timeComplexity} to O(n log n) or O(n)`
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
					`Average solve time is ${avgMins}m - practice to improve speed`
				);
			}
		}

		if (improvements.length === 0) {
			improvements.push("Keep practicing with harder problems!");
		}

		return improvements;
	};

	// Format time display
	const formatTime = (seconds: number): string => {
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

	// Get Monaco language from session language
	const getMonacoLanguage = (language: string): string => {
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

	const getRatingChangeColor = (change: number): string => {
		if (change > 0) return "text-green-400";
		if (change < 0) return "text-red-400";
		return "text-gray-400";
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#171717] flex items-center justify-center">
				<div className="text-center">
					<Loader2
						className="text-purple-500 mx-auto mb-4 animate-spin"
						size={48}
					/>
					<div className="text-white text-xl">
						Loading collaboration summary...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-[#171717] flex items-center justify-center">
				<div className="max-w-md mx-auto text-center p-8">
					<AlertTriangle className="text-yellow-500 mx-auto mb-4" size={64} />
					<h1 className="text-2xl font-bold text-white mb-4">
						Summary Not Available
					</h1>
					<p className="text-gray-400 mb-6">{error}</p>
					<button
						onClick={() => navigate("/explore")}
						className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition"
					>
						Back to Explore
					</button>
				</div>
			</div>
		);
	}

	if (!session || !teamEvaluation) {
		return (
			<div className="min-h-screen bg-[#171717] flex items-center justify-center">
				<div className="text-center">
					<AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
					<div className="text-white text-xl mb-4">Summary not found</div>
					<button
						onClick={() => navigate("/explore")}
						className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition"
					>
						Back to Explore
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#171717] text-gray-200">
			{/* Header */}
			<header className="bg-[#2c2c2c] p-4 shadow-md">
				<div className="container mx-auto">
					<div className="flex items-center justify-between">
						<button
							onClick={() => navigate("/explore")}
							className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
						>
							<ArrowLeft size={18} className="mr-1" />
							Back to Explore
						</button>
						<h1 className="text-xl font-bold text-center flex-grow flex items-center justify-center">
							<Rocket className="mr-2 text-purple-500" size={24} />
							Team Collaboration Summary
						</h1>
						<div className="w-20"></div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto py-6 px-4 max-w-5xl">
				{/* Result Banner */}
				<div
					className={`rounded-lg p-6 mb-8 text-center border ${
						teamEvaluation.isCorrect
							? "bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30"
							: "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/30"
					}`}
				>
					<div className="flex justify-center mb-4">
						{teamEvaluation.isCorrect ? (
							<div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-500/20">
								<Trophy className="text-green-400" size={40} />
							</div>
						) : (
							<div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-500/20">
								<XCircle className="text-red-400" size={40} />
							</div>
						)}
					</div>
					<h2 className="text-2xl font-bold mb-2">
						{teamEvaluation.isCorrect
							? "Problem Solved! 🎉"
							: "Not Quite There 💪"}
					</h2>
					<p className="text-lg text-gray-300">
						Problem:{" "}
						<span className="font-semibold text-purple-400">
							{session.problem?.title}
						</span>{" "}
						({session.problem?.difficulty})
					</p>
					<p className="text-sm text-gray-400 mt-2">
						Solved in {formatTime(teamEvaluation.solveTimeSeconds)} •{" "}
						{teamMembers.length} players • {session.time_limit} min limit
					</p>
					{historicalStats && historicalStats.totalCollaborations > 0 && (
						<p className="text-xs text-gray-500 mt-1">
							{historicalStats.totalCollaborations} previous attempts •{" "}
							{historicalStats.successRate.toFixed(0)}% success rate
						</p>
					)}
				</div>

				{/* Complexity & Time Analysis */}
				<div className="bg-[#2c2c2c] rounded-lg p-6 mb-6 border border-gray-700">
					<h3 className="text-xl font-semibold mb-4 flex items-center">
						<BarChart3 className="mr-2 text-purple-500" size={20} />
						Solution Analysis
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
							<Clock className="mx-auto mb-2 text-blue-400" size={24} />
							<div className="text-2xl font-bold text-blue-400">
								{teamEvaluation.complexity.timeComplexity}
							</div>
							<div className="text-sm text-gray-400">Time Complexity</div>
							{teamEvaluation.complexity.confidence !== "none" && (
								<div className="text-xs text-gray-500 mt-1">
									Confidence: {teamEvaluation.complexity.confidence}
								</div>
							)}
						</div>

						<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
							<Zap className="mx-auto mb-2 text-yellow-400" size={24} />
							<div className="text-2xl font-bold text-yellow-400">
								{teamEvaluation.complexity.spaceComplexity}
							</div>
							<div className="text-sm text-gray-400">Space Complexity</div>
						</div>

						<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
							<Timer className="mx-auto mb-2 text-green-400" size={24} />
							<div className="text-2xl font-bold text-green-400">
								{formatTime(teamEvaluation.solveTimeSeconds)}
							</div>
							<div className="text-sm text-gray-400">Solve Time</div>
							{teamEvaluation.percentiles && (
								<div className="text-xs text-gray-500 mt-1">
									Avg: {formatTime(teamEvaluation.percentiles.averageSolveTime)}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Solution Comparison Charts - LeetCode Style */}
				{distributionData &&
					(distributionData.timeDistribution.some((d) => d.count > 0) ||
						distributionData.complexityDistribution.some(
							(d) => d.count > 0
						)) && (
						<div className="bg-[#2c2c2c] rounded-lg p-6 mb-6 border border-gray-700">
							<h3 className="text-xl font-semibold mb-4 flex items-center">
								<Target className="mr-2 text-purple-500" size={20} />
								How You Compare to Other Teams
							</h3>

							{teamEvaluation.percentiles && (
								<p className="text-sm text-gray-400 mb-6">
									Compared against {teamEvaluation.percentiles.totalComparisons}{" "}
									successful collaboration
									{teamEvaluation.percentiles.totalComparisons !== 1
										? "s"
										: ""}{" "}
									on this problem
								</p>
							)}

							{/* Runtime Distribution Chart */}
							<div className="bg-[#1f1f1f] rounded-lg p-4 mb-4">
								<div className="flex items-center justify-between mb-4">
									<h4 className="text-sm font-medium text-gray-300 flex items-center">
										<Timer size={16} className="mr-2 text-green-400" />
										Runtime Distribution
									</h4>
									{teamEvaluation.percentiles && (
										<span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
											Beats {teamEvaluation.percentiles.timePercentile}%
										</span>
									)}
								</div>

								<div className="space-y-2">
									{distributionData.timeDistribution.map((bucket, idx) => {
										const maxCount = Math.max(
											...distributionData.timeDistribution.map((d) => d.count),
											1
										);
										const width =
											bucket.count > 0
												? Math.max((bucket.count / maxCount) * 100, 8)
												: 0;

										return (
											<div key={idx} className="flex items-center gap-2">
												<span className="text-xs text-gray-500 w-16 text-right font-mono">
													{bucket.range}
												</span>
												<div className="flex-1 h-6 bg-[#2a2a2a] rounded overflow-hidden relative">
													<div
														className={`h-full rounded transition-all duration-500 ${
															bucket.isYours
																? "bg-gradient-to-r from-green-500 to-green-400"
																: "bg-gray-600"
														}`}
														style={{ width: `${width}%` }}
													/>
													{bucket.isYours && (
														<div className="absolute inset-0 flex items-center justify-end pr-2">
															<span className="text-xs font-bold text-white drop-shadow-lg">
																You
															</span>
														</div>
													)}
												</div>
												<span className="text-xs text-gray-500 w-8 font-mono">
													{bucket.count}
												</span>
											</div>
										);
									})}
								</div>

								<div className="mt-4 pt-3 border-t border-gray-700">
									<div className="flex justify-between text-xs text-gray-500">
										<span>
											Your time:{" "}
											<span className="text-green-400 font-medium">
												{formatTime(teamEvaluation.solveTimeSeconds)}
											</span>
										</span>
										{teamEvaluation.percentiles && (
											<span>
												Avg:{" "}
												{formatTime(
													teamEvaluation.percentiles.averageSolveTime
												)}
											</span>
										)}
									</div>
								</div>
							</div>

							{/* Time & Space Complexity Charts */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
								{/* Time Complexity Distribution Chart */}
								<div className="bg-[#1f1f1f] rounded-lg p-4">
									<div className="flex items-center justify-between mb-4">
										<h4 className="text-sm font-medium text-gray-300 flex items-center">
											<Zap size={16} className="mr-2 text-blue-400" />
											Time Complexity Distribution
										</h4>
										{teamEvaluation.percentiles && (
											<span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
												Beats {teamEvaluation.percentiles.complexityPercentile}%
											</span>
										)}
									</div>

									<div className="space-y-2">
										{distributionData.complexityDistribution.map(
											(bucket, idx) => {
												const maxCount = Math.max(
													...distributionData.complexityDistribution.map(
														(d) => d.count
													),
													1
												);
												const width =
													bucket.count > 0
														? Math.max((bucket.count / maxCount) * 100, 8)
														: 0;

												return (
													<div key={idx} className="flex items-center gap-2">
														<span className="text-xs text-gray-500 w-20 text-right font-mono">
															{bucket.complexity}
														</span>
														<div className="flex-1 h-6 bg-[#2a2a2a] rounded overflow-hidden relative">
															<div
																className={`h-full rounded transition-all duration-500 ${
																	bucket.isYours
																		? "bg-gradient-to-r from-blue-500 to-blue-400"
																		: "bg-gray-600"
																}`}
																style={{ width: `${width}%` }}
															/>
															{bucket.isYours && (
																<div className="absolute inset-0 flex items-center justify-end pr-2">
																	<span className="text-xs font-bold text-white drop-shadow-lg">
																		You
																	</span>
																</div>
															)}
														</div>
														<span className="text-xs text-gray-500 w-8 font-mono">
															{bucket.count}
														</span>
													</div>
												);
											}
										)}
									</div>

									<div className="mt-4 pt-3 border-t border-gray-700">
										<div className="text-xs text-gray-500">
											Your complexity:{" "}
											<span className="text-blue-400 font-medium">
												{teamEvaluation.complexity.timeComplexity}
											</span>
										</div>
									</div>
								</div>

								{/* Space Complexity Distribution Chart */}
								<div className="bg-[#1f1f1f] rounded-lg p-4">
									<div className="flex items-center justify-between mb-4">
										<h4 className="text-sm font-medium text-gray-300 flex items-center">
											<BarChart3 size={16} className="mr-2 text-yellow-400" />
											Space Complexity Distribution
										</h4>
									</div>

									<div className="space-y-2">
										{distributionData.spaceComplexityDistribution.map(
											(bucket, idx) => {
												const maxCount = Math.max(
													...distributionData.spaceComplexityDistribution.map(
														(d) => d.count
													),
													1
												);
												const width =
													bucket.count > 0
														? Math.max((bucket.count / maxCount) * 100, 8)
														: 0;

												return (
													<div key={idx} className="flex items-center gap-2">
														<span className="text-xs text-gray-500 w-20 text-right font-mono">
															{bucket.complexity}
														</span>
														<div className="flex-1 h-6 bg-[#2a2a2a] rounded overflow-hidden relative">
															<div
																className={`h-full rounded transition-all duration-500 ${
																	bucket.isYours
																		? "bg-gradient-to-r from-yellow-500 to-yellow-400"
																		: "bg-gray-600"
																}`}
																style={{ width: `${width}%` }}
															/>
															{bucket.isYours && (
																<div className="absolute inset-0 flex items-center justify-end pr-2">
																	<span className="text-xs font-bold text-white drop-shadow-lg">
																		You
																	</span>
																</div>
															)}
														</div>
														<span className="text-xs text-gray-500 w-8 font-mono">
															{bucket.count}
														</span>
													</div>
												);
											}
										)}
									</div>

									<div className="mt-4 pt-3 border-t border-gray-700">
										<div className="text-xs text-gray-500">
											Your complexity:{" "}
											<span className="text-yellow-400 font-medium">
												{teamEvaluation.complexity.spaceComplexity}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Percentile Summary with Legends */}
							{teamEvaluation.percentiles && (
								<div className="bg-[#1f1f1f] rounded-lg p-4">
									<h4 className="text-sm font-medium text-gray-300 mb-4">
										Performance Summary
									</h4>

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
										<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
											<div className="text-2xl font-bold text-green-400">
												{teamEvaluation.percentiles.timePercentile}%
											</div>
											<div className="text-xs text-gray-500">
												Runtime Percentile
											</div>
										</div>
										<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
											<div className="text-2xl font-bold text-blue-400">
												{teamEvaluation.percentiles.complexityPercentile}%
											</div>
											<div className="text-xs text-gray-500">
												Complexity Percentile
											</div>
										</div>
										<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
											<div className="text-2xl font-bold text-purple-400">
												{formatTime(
													teamEvaluation.percentiles.fastestSolveTime
												)}
											</div>
											<div className="text-xs text-gray-500">
												Fastest Solution
											</div>
										</div>
										<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
											<div className="text-2xl font-bold text-gray-400">
												{teamEvaluation.percentiles.totalComparisons}
											</div>
											<div className="text-xs text-gray-500">
												Total Solutions
											</div>
										</div>
									</div>

									{/* Legend Section */}
									<div className="border-t border-gray-700 pt-4">
										<h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center">
											<Lightbulb size={12} className="mr-1" />
											What These Metrics Mean
										</h5>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
											<div className="flex items-start gap-2 p-2 bg-[#2a2a2a] rounded">
												<div className="w-3 h-3 rounded-full bg-green-400 mt-0.5 flex-shrink-0" />
												<div>
													<span className="text-gray-300 font-medium">
														Runtime Percentile
													</span>
													<p className="text-gray-500 mt-0.5">
														The percentage of teams you solved faster than. A
														higher percentage means you were quicker than more
														teams.
													</p>
												</div>
											</div>
											<div className="flex items-start gap-2 p-2 bg-[#2a2a2a] rounded">
												<div className="w-3 h-3 rounded-full bg-blue-400 mt-0.5 flex-shrink-0" />
												<div>
													<span className="text-gray-300 font-medium">
														Complexity Percentile
													</span>
													<p className="text-gray-500 mt-0.5">
														The percentage of teams whose solution had worse
														time complexity than yours. Higher is better (more
														efficient algorithm).
													</p>
												</div>
											</div>
											<div className="flex items-start gap-2 p-2 bg-[#2a2a2a] rounded">
												<div className="w-3 h-3 rounded-full bg-blue-400 mt-0.5 flex-shrink-0" />
												<div>
													<span className="text-gray-300 font-medium">
														Time Complexity
													</span>
													<p className="text-gray-500 mt-0.5">
														How your algorithm's runtime scales with input size.
														O(n) is linear, O(n²) is quadratic, O(log n) is
														logarithmic. Lower is generally better.
													</p>
												</div>
											</div>
											<div className="flex items-start gap-2 p-2 bg-[#2a2a2a] rounded">
												<div className="w-3 h-3 rounded-full bg-yellow-400 mt-0.5 flex-shrink-0" />
												<div>
													<span className="text-gray-300 font-medium">
														Space Complexity
													</span>
													<p className="text-gray-500 mt-0.5">
														How much memory your algorithm uses relative to
														input size. O(1) means constant space, O(n) means
														linear space usage.
													</p>
												</div>
											</div>
										</div>
									</div>

									{/* Chart Legend */}
									<div className="border-t border-gray-700 pt-4 mt-4">
										<h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
											Chart Legend
										</h5>
										<div className="flex flex-wrap gap-4 text-xs">
											<div className="flex items-center gap-2">
												<div className="w-4 h-3 rounded bg-gradient-to-r from-green-500 to-green-400" />
												<span className="text-gray-400">Your runtime</span>
											</div>
											<div className="flex items-center gap-2">
												<div className="w-4 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-400" />
												<span className="text-gray-400">
													Your time complexity
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div className="w-4 h-3 rounded bg-gradient-to-r from-yellow-500 to-yellow-400" />
												<span className="text-gray-400">
													Your space complexity
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div className="w-4 h-3 rounded bg-gray-600" />
												<span className="text-gray-400">Other teams</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-gray-500 font-mono">#</span>
												<span className="text-gray-400">
													Number of solutions in that range
												</span>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					)}

				{/* Team Members with Rating Changes */}
				<div className="bg-[#2c2c2c] rounded-lg p-6 mb-6 border border-gray-700">
					<h3 className="text-xl font-semibold mb-4 flex items-center">
						<Users className="mr-2 text-purple-500" size={20} />
						Team Members
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{teamMembers.map((member, index) => (
							<div
								key={index}
								className={`flex items-center space-x-4 p-4 bg-[#1f1f1f] rounded-lg ${
									member.id === currentUserId ? "ring-2 ring-purple-500/50" : ""
								}`}
							>
								<div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
									{member.name.charAt(0).toUpperCase()}
								</div>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<p className="font-medium text-white">
											{member.name}
											{member.id === currentUserId && (
												<span className="text-purple-400 text-xs ml-2">
													(You)
												</span>
											)}
										</p>
										<div
											className={`flex items-center ${getRatingChangeColor(
												member.ratingChange
											)}`}
										>
											{member.ratingChange > 0 ? (
												<TrendingUp size={14} className="mr-1" />
											) : member.ratingChange < 0 ? (
												<TrendingDown size={14} className="mr-1" />
											) : null}
											<span className="font-bold">
												{member.ratingChange > 0 ? "+" : ""}
												{member.ratingChange}
											</span>
										</div>
									</div>
									<div className="flex items-center space-x-3 text-sm text-gray-400">
										<span className="flex items-center">
											<CheckCircle size={14} className="mr-1 text-green-400" />
											{member.passedTests}/{member.totalTests} tests
										</span>
										<span className="flex items-center">
											<Award size={14} className="mr-1" />
											{member.ratingBefore + member.ratingChange} ELO
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Feedback Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div className="bg-[#2c2c2c] rounded-lg p-6 border border-gray-700">
						<h3 className="text-lg font-semibold mb-4 flex items-center text-green-400">
							<Star className="mr-2" size={20} />
							Team Strengths
						</h3>
						<ul className="space-y-2">
							{teamEvaluation.strengths.map((strength, index) => (
								<li key={index} className="flex items-start space-x-2">
									<CheckCircle
										size={16}
										className="text-green-400 mt-1 flex-shrink-0"
									/>
									<span className="text-gray-300">{strength}</span>
								</li>
							))}
						</ul>
					</div>

					<div className="bg-[#2c2c2c] rounded-lg p-6 border border-gray-700">
						<h3 className="text-lg font-semibold mb-4 flex items-center text-yellow-400">
							<TrendingUp className="mr-2" size={20} />
							Areas to Improve
						</h3>
						<ul className="space-y-2">
							{teamEvaluation.improvements.map((improvement, index) => (
								<li key={index} className="flex items-start space-x-2">
									<Lightbulb
										size={16}
										className="text-yellow-400 mt-1 flex-shrink-0"
									/>
									<span className="text-gray-300">{improvement}</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Overall Feedback */}
				<div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
						<Lightbulb className="mr-2" size={20} />
						Team Feedback
					</h3>
					<div className="space-y-2">
						{teamEvaluation.feedback.map((fb, index) => (
							<p key={index} className="text-gray-300">
								{fb}
							</p>
						))}
					</div>
				</div>

				{/* Code Preview with Syntax Highlighting */}
				{sharedCode && (
					<div className="bg-[#2c2c2c] rounded-lg p-6 border border-gray-700">
						<h3 className="text-lg font-semibold mb-4 flex items-center">
							<Code className="mr-2 text-purple-500" size={20} />
							Your Team's Solution
						</h3>
						<div className="rounded-lg overflow-hidden border border-gray-700">
							<Editor
								height="400px"
								language={getMonacoLanguage(session.language)}
								value={sharedCode}
								theme="vs-dark"
								options={{
									readOnly: true,
									fontSize: 14,
									fontFamily: "Fira Code, Monaco, Menlo, Consolas, monospace",
									minimap: { enabled: false },
									lineNumbers: "on",
									scrollBeyondLastLine: false,
									wordWrap: "on",
									folding: true,
									renderWhitespace: "none",
									padding: { top: 16, bottom: 16 },
									scrollbar: {
										vertical: "auto",
										horizontal: "auto",
										verticalScrollbarSize: 10,
										horizontalScrollbarSize: 10,
									},
									overviewRulerLanes: 0,
									hideCursorInOverviewRuler: true,
									overviewRulerBorder: false,
									contextmenu: false,
									selectOnLineNumbers: false,
									cursorStyle: "line",
									cursorBlinking: "solid",
								}}
							/>
						</div>
						<div className="mt-3 flex items-center justify-between text-xs text-gray-500">
							<span className="flex items-center">
								<Code size={12} className="mr-1" />
								{session.language?.charAt(0).toUpperCase() +
									session.language?.slice(1)}{" "}
								• {sharedCode.split("\n").length} lines
							</span>
							<span>
								{teamEvaluation.complexity.timeComplexity} time •{" "}
								{teamEvaluation.complexity.spaceComplexity} space
							</span>
						</div>
					</div>
				)}

				{/* Action Button */}
				<div className="text-center mt-8">
					<button
						onClick={() => navigate("/explore")}
						className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition inline-flex items-center"
					>
						<Rocket className="mr-2" size={20} />
						Start Another Collaboration
					</button>
				</div>
			</main>
		</div>
	);
}
