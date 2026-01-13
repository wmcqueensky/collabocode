import { useState, useEffect } from "react";
import {
	ArrowLeft,
	Award,
	Clock,
	Code,
	Trophy,
	User,
	AlertTriangle,
	Zap,
	Loader2,
	CheckCircle,
	Target,
	Timer,
	BarChart3,
	Lightbulb,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import { useParams, useNavigate } from "react-router-dom";
import { matchService } from "../../services/matchService";
import { sessionService } from "../../services/sessionService";
import { codeAnalyzerService } from "../../services/codeAnalyzerService";
import { supabase } from "../../lib/supabase";

interface HistoricalSolution {
	odsolveTime: number;
	timeComplexity: string;
	spaceComplexity: string;
	complexityScore: number;
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
	totalComparisons: number;
	timePercentile: number;
	complexityPercentile: number;
	averageSolveTime: number;
	fastestSolveTime: number;
}

export default function MatchSummaryPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [summaryData, setSummaryData] = useState<any>(null);
	const [accessError, setAccessError] = useState<string | null>(null);
	const [distributionData, setDistributionData] =
		useState<DistributionData | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string>("");

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

		checkAccessAndLoadSummary();
	}, [sessionId]);

	const checkAccessAndLoadSummary = async () => {
		try {
			setLoading(true);
			setAccessError(null);

			// First, check if session is completed
			const session = await sessionService.getSessionById(sessionId!);

			if (!session) {
				setAccessError("Session not found");
				setLoading(false);
				return;
			}

			// Check if session is completed
			if (session.status !== "completed") {
				setAccessError(
					"This match is still in progress. You'll be notified when all players have submitted their solutions."
				);
				setLoading(false);
				return;
			}

			// Check if all participants have submitted
			const allSubmitted = await matchService.checkAllSubmitted(sessionId!);

			if (!allSubmitted) {
				setAccessError(
					"Not all players have submitted yet. Please wait for the match to complete."
				);
				setLoading(false);
				return;
			}

			// Load summary data
			const data = await matchService.getMatchSummary(sessionId!);
			setSummaryData(data);

			// Load distribution data for comparison charts
			const winner = data.players.find((p: any) => p.rank === 1);
			if (winner) {
				const distribution = await loadDistributionData(
					session.problem_id,
					winner.timeToSolve,
					winner.timeComplexity,
					winner.spaceComplexity,
					session.language
				);
				setDistributionData(distribution);
			}
		} catch (error) {
			console.error("Error loading match summary:", error);
			setAccessError("Failed to load match summary");
		} finally {
			setLoading(false);
		}
	};

	// Load distribution data for comparison charts
	const loadDistributionData = async (
		problemId: string,
		currentSolveTime: number,
		currentTimeComplexity: string,
		currentSpaceComplexity: string,
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
						is_correct,
						ranking
					)
				`
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
					(p: any) => p.ranking === 1 && p.is_correct
				);
				if (!winner) continue;

				const startTime = session.started_at
					? new Date(session.started_at).getTime()
					: 0;

				if (!winner.submission_time || startTime === 0) continue;

				const sessionSolveTime = Math.floor(
					(new Date(winner.submission_time).getTime() - startTime) / 1000
				);

				const historicalComplexity = codeAnalyzerService.analyzeComplexity(
					winner.code_snapshot || "",
					session.language || language
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
						(s) => s.spaceComplexity === complexity
					).length;
					const isYours = currentSpaceComplexity === complexity;
					return { complexity, count, isYours };
				})
				.filter((d) => d.count > 0 || d.isYours);

			// Calculate percentiles
			const fasterThan = historicalSolutions.filter(
				(s) => s.solveTime > currentSolveTime
			).length;
			const timePercentile = Math.round(
				(fasterThan / historicalSolutions.length) * 100
			);

			const currentComplexityScore = getComplexityScore({
				timeComplexity: currentTimeComplexity,
				spaceComplexity: currentSpaceComplexity,
				confidence: "high",
			});
			const betterComplexityThan = historicalSolutions.filter(
				(s) => s.complexityScore < currentComplexityScore
			).length;
			const complexityPercentile = Math.round(
				(betterComplexityThan / historicalSolutions.length) * 100
			);

			const solveTimes = historicalSolutions.map((s) => s.solveTime);
			const averageSolveTime = Math.round(
				solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length
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

	// Convert complexity to numeric score for comparison
	const getComplexityScore = (complexity: {
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

	if (loading) {
		return (
			<div className="min-h-screen bg-[#171717] flex items-center justify-center">
				<div className="text-center">
					<Loader2
						className="text-[#5bc6ca] mx-auto mb-4 animate-spin"
						size={48}
					/>
					<div className="text-white text-xl">Loading match summary...</div>
				</div>
			</div>
		);
	}

	if (accessError) {
		return (
			<div className="min-h-screen bg-[#171717] flex items-center justify-center">
				<div className="max-w-md mx-auto text-center p-8">
					<AlertTriangle className="text-yellow-500 mx-auto mb-4" size={64} />
					<h1 className="text-2xl font-bold text-white mb-4">
						Match Summary Not Available
					</h1>
					<p className="text-gray-400 mb-6">{accessError}</p>
					<button
						onClick={() => navigate("/explore")}
						className="bg-[#5bc6ca] hover:bg-[#48aeb3] text-white px-6 py-3 rounded-lg font-medium transition"
					>
						Back to Explore
					</button>
				</div>
			</div>
		);
	}

	if (!summaryData) {
		return (
			<div className="min-h-screen bg-[#171717] flex items-center justify-center">
				<div className="text-center">
					<AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
					<div className="text-white text-xl mb-4">Match summary not found</div>
					<button
						onClick={() => navigate("/explore")}
						className="bg-[#5bc6ca] hover:bg-[#48aeb3] text-white px-6 py-3 rounded-lg font-medium transition"
					>
						Back to Explore
					</button>
				</div>
			</div>
		);
	}

	// Prepare time performance data with indicator colors (green = fast, red = slow)
	const timePerformanceData = summaryData.players
		.filter((p: any) => p.timeToSolve > 0)
		.map((player: any) => ({
			name: player.name,
			time: player.timeToSolve,
			formattedTime: player.formattedTime,
			fill:
				player.timeToSolve <= 180 // 3 minutes - excellent
					? "#6BCB77"
					: player.timeToSolve <= 300 // 5 minutes - good
					? "#FFD93D"
					: player.timeToSolve <= 600 // 10 minutes - okay
					? "#ffa726"
					: "#FF6B6B", // slow
		}))
		.sort((a: any, b: any) => a.time - b.time);

	// Prepare code quality data with indicator colors
	const codeQualityData = summaryData.players
		.map((player: any) => ({
			name: player.name,
			score: player.codeQualityScore,
			fill:
				player.codeQualityScore >= 100
					? "#6BCB77"
					: player.codeQualityScore >= 75
					? "#FFD93D"
					: player.codeQualityScore >= 50
					? "#ffa726"
					: "#FF6B6B",
		}))
		.sort((a: any, b: any) => b.score - a.score);

	return (
		<div className="min-h-screen bg-[#171717] text-gray-200">
			{/* Header */}
			<header className="bg-[#2c2c2c] p-4 shadow-md">
				<div className="container mx-auto">
					<div className="flex items-center justify-between">
						<button
							onClick={() => navigate("/explore")}
							className="flex items-center text-[#5bc6ca] hover:text-[#48aeb3] transition-colors"
						>
							<ArrowLeft size={18} className="mr-1" />
							Back to Explore
						</button>
						<h1 className="text-xl font-bold text-center flex-grow">
							Match Summary
						</h1>
						<div className="w-20"></div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto py-6 px-4 max-w-5xl">
				{/* Success Banner */}
				<div className="bg-gradient-to-r from-[#5bc6ca]/20 to-[#48aeb3]/20 border border-[#5bc6ca]/30 rounded-lg p-6 mb-8 text-center shadow-lg">
					<div className="flex justify-center mb-4">
						<Trophy size={48} className="text-[#5bc6ca]" />
					</div>
					<h2 className="text-2xl font-bold mb-2">Match Complete!</h2>
					<p className="text-lg text-gray-300">
						Problem:{" "}
						<span className="font-semibold text-[#5bc6ca]">
							{summaryData.problemName}
						</span>{" "}
						({summaryData.difficulty})
					</p>
					<div className="mt-4 flex justify-center items-center gap-4 flex-wrap">
						<div className="flex items-center">
							<User className="text-[#5bc6ca] mr-1" size={20} />
							<span>{summaryData.totalParticipants} Players</span>
						</div>
						<div className="flex items-center">
							<Award className="text-[#5bc6ca] mr-1" size={20} />
							<span>Winner: {summaryData.winner}</span>
						</div>
						{summaryData.winnerTime && summaryData.winnerTime !== "N/A" && (
							<div className="flex items-center">
								<Clock className="text-[#5bc6ca] mr-1" size={20} />
								<span>Best Time: {summaryData.winnerTime}</span>
							</div>
						)}
					</div>
				</div>

				{/* Leaderboard - Now using the detailed performance comparison layout */}
				<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md mb-6 border border-gray-700">
					<h3 className="text-xl font-semibold mb-4 flex items-center">
						<Trophy className="mr-2 text-[#5bc6ca]" size={20} />
						Leaderboard
					</h3>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-600">
									<th className="py-3 px-4 text-left text-gray-400 font-medium">
										Player
									</th>
									<th className="py-3 px-4 text-center text-gray-400 font-medium">
										<div className="flex flex-col items-center">
											<Clock size={16} className="mb-1" />
											<span>Time</span>
										</div>
									</th>
									<th className="py-3 px-4 text-center text-gray-400 font-medium">
										<div className="flex flex-col items-center">
											<CheckCircle size={16} className="mb-1" />
											<span>Tests Passed</span>
										</div>
									</th>
									<th className="py-3 px-4 text-center text-gray-400 font-medium">
										<div className="flex flex-col items-center">
											<Zap size={16} className="mb-1" />
											<span>Time Complexity</span>
										</div>
									</th>
									<th className="py-3 px-4 text-center text-gray-400 font-medium">
										<div className="flex flex-col items-center">
											<Code size={16} className="mb-1" />
											<span>Space Complexity</span>
										</div>
									</th>
									<th className="py-3 px-4 text-center text-gray-400 font-medium">
										<div className="flex flex-col items-center">
											<Trophy size={16} className="mb-1" />
											<span>Rating Change</span>
										</div>
									</th>
								</tr>
							</thead>
							<tbody>
								{summaryData.players.map((player: any, index: number) => (
									<tr
										key={player.userId}
										className={`border-b border-gray-700 ${
											index === 0 ? "bg-[#5bc6ca]/10" : ""
										}`}
									>
										{/* Player Name & Rank */}
										<td className="py-4 px-4">
											<div className="flex items-center gap-3">
												<div className="flex items-center gap-2">
													{index === 0 && (
														<Trophy size={18} className="text-[#FFD93D]" />
													)}
													{index === 1 && (
														<Trophy size={18} className="text-gray-300" />
													)}
													{index === 2 && (
														<Trophy size={18} className="text-amber-700" />
													)}
													<span className="text-gray-400 font-mono">
														#{player.rank}
													</span>
												</div>
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${player.textColor}`}
													style={{ backgroundColor: player.bgColor }}
												>
													{player.initial}
												</div>
												<span className="font-medium text-white">
													{player.name}
												</span>
											</div>
										</td>

										{/* Time */}
										<td className="py-4 px-4 text-center">
											<div className="flex flex-col items-center">
												<span className="font-mono text-lg text-white">
													{player.formattedTime !== "0:00"
														? player.formattedTime
														: "N/A"}
												</span>
												{player.formattedTime !== "0:00" && (
													<span className="text-xs text-gray-500 mt-1">
														{player.timeToSolve}s
													</span>
												)}
											</div>
										</td>

										{/* Tests Passed */}
										<td className="py-4 px-4 text-center">
											<div className="flex flex-col items-center gap-2">
												{/* Progress bar */}
												<div className="w-full max-w-[120px] bg-gray-700 rounded-full h-2">
													<div
														className={`h-2 rounded-full transition-all ${
															player.passedTestCases === 100
																? "bg-[#6BCB77]"
																: player.passedTestCases >= 75
																? "bg-[#FFD93D]"
																: player.passedTestCases >= 50
																? "bg-[#ffa726]"
																: "bg-[#FF6B6B]"
														}`}
														style={{ width: `${player.passedTestCases}%` }}
													/>
												</div>
												{/* Numbers */}
												<div className="flex items-center gap-2">
													<span
														className={`font-medium ${
															player.passedTestCases === 100
																? "text-[#6BCB77]"
																: player.passedTestCases >= 75
																? "text-[#FFD93D]"
																: player.passedTestCases >= 50
																? "text-[#ffa726]"
																: "text-[#FF6B6B]"
														}`}
													>
														{player.passedTestCount}/{player.totalTestCount}
													</span>
													<span className="text-xs text-gray-500">
														({player.passedTestCases}%)
													</span>
												</div>
											</div>
										</td>

										{/* Time Complexity */}
										<td className="py-4 px-4 text-center">
											{(() => {
												const getTimeComplexityColor = (complexity: string) => {
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
												return (
													<span
														className={`inline-block px-3 py-1 rounded-full font-mono text-sm ${getTimeComplexityColor(
															player.timeComplexity
														)}`}
													>
														{player.timeComplexity}
													</span>
												);
											})()}
										</td>

										{/* Space Complexity */}
										<td className="py-4 px-4 text-center">
											{(() => {
												const getSpaceComplexityColor = (
													complexity: string
												) => {
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
												return (
													<span
														className={`inline-block px-3 py-1 rounded-full font-mono text-sm ${getSpaceComplexityColor(
															player.spaceComplexity
														)}`}
													>
														{player.spaceComplexity}
													</span>
												);
											})()}
										</td>

										{/* Rating Change */}
										<td className="py-4 px-4 text-center">
											<div className="flex flex-col items-center gap-1">
												<div className="flex items-center gap-1">
													<span className="text-gray-500 text-sm">
														{player.previousRating}
													</span>
													<span className="text-gray-600">→</span>
													<span className="text-white font-medium">
														{player.currentRating}
													</span>
												</div>
												<span
													className={`text-sm font-bold ${
														player.ratingChange > 0
															? "text-green-400"
															: "text-red-400"
													}`}
												>
													{player.ratingChange > 0 ? "+" : ""}
													{player.ratingChange}
												</span>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					{/* Average Test Pass Rate Per User */}
					<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md border border-gray-700">
						<div className="flex items-center justify-between mb-2">
							<h4 className="text-sm text-gray-400">Avg Tests Per User</h4>
							<CheckCircle className="text-[#5bc6ca]" size={20} />
						</div>
						<div className="text-3xl font-bold text-white">
							{(
								summaryData.players.reduce(
									(sum: number, p: any) => sum + p.passedTestCount,
									0
								) / summaryData.players.length
							).toFixed(1)}
							{" / "}
							{(
								summaryData.players.reduce(
									(sum: number, p: any) => sum + p.totalTestCount,
									0
								) / summaryData.players.length
							).toFixed(1)}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							tests solved per player on average
						</div>
					</div>

					{/* Fastest Solution */}
					<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md border border-gray-700">
						<div className="flex items-center justify-between mb-2">
							<h4 className="text-sm text-gray-400">Fastest Solution</h4>
							<Zap className="text-[#5bc6ca]" size={20} />
						</div>
						<div className="text-3xl font-bold text-white font-mono">
							{summaryData.winnerTime}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							by {summaryData.winner}
						</div>
					</div>

					{/* Success Rate */}
					<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md border border-gray-700">
						<div className="flex items-center justify-between mb-2">
							<h4 className="text-sm text-gray-400">Completion Rate</h4>
							<Trophy className="text-[#5bc6ca]" size={20} />
						</div>
						<div className="text-3xl font-bold text-white">
							{Math.round(
								(summaryData.players.filter((p: any) => p.isCorrect).length /
									summaryData.players.length) *
									100
							)}
							%
						</div>
						<div className="text-xs text-gray-500 mt-1">
							{summaryData.players.filter((p: any) => p.isCorrect).length} /{" "}
							{summaryData.players.length} solved correctly
						</div>
					</div>
				</div>

				{/* Solution Comparison Charts */}
				{distributionData &&
					(distributionData.timeDistribution.some((d) => d.count > 0) ||
						distributionData.complexityDistribution.some(
							(d) => d.count > 0
						)) && (
						<div className="bg-[#2c2c2c] rounded-lg p-6 mb-6 border border-gray-700">
							<h3 className="text-xl font-semibold mb-4 flex items-center">
								<Target className="mr-2 text-[#5bc6ca]" size={20} />
								How This Match Compares to Others
							</h3>

							<p className="text-sm text-gray-400 mb-6">
								Compared against {distributionData.totalComparisons} winning
								solution{distributionData.totalComparisons !== 1 ? "s" : ""}{" "}
								from previous matches on this problem
							</p>

							{/* Runtime Distribution Chart */}
							<div className="bg-[#1f1f1f] rounded-lg p-4 mb-4">
								<div className="flex items-center justify-between mb-4">
									<h4 className="text-sm font-medium text-gray-300 flex items-center">
										<Timer size={16} className="mr-2 text-[#5bc6ca]" />
										Runtime Distribution
									</h4>
									<span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
										Beats {distributionData.timePercentile}%
									</span>
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
																Winner
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
											Winner's time:{" "}
											<span className="text-green-400 font-medium">
												{summaryData.winnerTime}
											</span>
										</span>
										<span>
											Avg: {formatTime(distributionData.averageSolveTime)}
										</span>
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
										<span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
											Beats {distributionData.complexityPercentile}%
										</span>
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

												// Color based on complexity quality
												const getComplexityBarColor = (
													complexity: string,
													isYours: boolean
												) => {
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

												return (
													<div key={idx} className="flex items-center gap-2">
														<span className="text-xs text-gray-500 w-20 text-right font-mono">
															{bucket.complexity}
														</span>
														<div className="flex-1 h-6 bg-[#2a2a2a] rounded overflow-hidden relative">
															<div
																className={`h-full rounded transition-all duration-500 ${getComplexityBarColor(
																	bucket.complexity,
																	bucket.isYours
																)}`}
																style={{ width: `${width}%` }}
															/>
															{bucket.isYours && (
																<div className="absolute inset-0 flex items-center justify-end pr-2">
																	<span className="text-xs font-bold text-white drop-shadow-lg">
																		Winner
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
											Winner's complexity:{" "}
											<span className="text-blue-400 font-medium">
												{summaryData.players[0]?.timeComplexity}
											</span>
										</div>
									</div>
								</div>

								{/* Space Complexity Distribution Chart */}
								<div className="bg-[#1f1f1f] rounded-lg p-4">
									<div className="flex items-center justify-between mb-4">
										<h4 className="text-sm font-medium text-gray-300 flex items-center">
											<BarChart3 size={16} className="mr-2 text-purple-400" />
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

												// Color based on space complexity quality
												const getSpaceComplexityBarColor = (
													complexity: string,
													isYours: boolean
												) => {
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

												return (
													<div key={idx} className="flex items-center gap-2">
														<span className="text-xs text-gray-500 w-20 text-right font-mono">
															{bucket.complexity}
														</span>
														<div className="flex-1 h-6 bg-[#2a2a2a] rounded overflow-hidden relative">
															<div
																className={`h-full rounded transition-all duration-500 ${getSpaceComplexityBarColor(
																	bucket.complexity,
																	bucket.isYours
																)}`}
																style={{ width: `${width}%` }}
															/>
															{bucket.isYours && (
																<div className="absolute inset-0 flex items-center justify-end pr-2">
																	<span className="text-xs font-bold text-white drop-shadow-lg">
																		Winner
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
											Winner's complexity:{" "}
											<span className="text-purple-400 font-medium">
												{summaryData.players[0]?.spaceComplexity}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Percentile Summary with Legends */}
							<div className="bg-[#1f1f1f] rounded-lg p-4">
								<h4 className="text-sm font-medium text-gray-300 mb-4">
									Performance Summary
								</h4>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
									<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
										<div className="text-2xl font-bold text-green-400">
											{distributionData.timePercentile}%
										</div>
										<div className="text-xs text-gray-500">
											Runtime Percentile
										</div>
									</div>
									<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
										<div className="text-2xl font-bold text-blue-400">
											{distributionData.complexityPercentile}%
										</div>
										<div className="text-xs text-gray-500">
											Complexity Percentile
										</div>
									</div>
									<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
										<div className="text-2xl font-bold text-purple-400">
											{formatTime(distributionData.fastestSolveTime)}
										</div>
										<div className="text-xs text-gray-500">Fastest Ever</div>
									</div>
									<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
										<div className="text-2xl font-bold text-gray-400">
											{distributionData.totalComparisons}
										</div>
										<div className="text-xs text-gray-500">Total Matches</div>
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
													The percentage of previous winning solutions that were
													slower. Higher is better.
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
													The percentage of solutions with worse algorithmic
													efficiency. Higher means more optimal.
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
													How runtime scales with input size. O(n) is linear,
													O(n²) is quadratic. Lower is better.
												</p>
											</div>
										</div>
										<div className="flex items-start gap-2 p-2 bg-[#2a2a2a] rounded">
											<div className="w-3 h-3 rounded-full bg-purple-400 mt-0.5 flex-shrink-0" />
											<div>
												<span className="text-gray-300 font-medium">
													Space Complexity
												</span>
												<p className="text-gray-500 mt-0.5">
													How memory usage scales with input. O(1) is constant,
													O(n) grows with input size.
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
											<span className="text-gray-400">
												Excellent (O(1), O(log n))
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-3 rounded bg-gradient-to-r from-yellow-500 to-yellow-400" />
											<span className="text-gray-400">
												Good (O(n), O(n log n))
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-3 rounded bg-gradient-to-r from-orange-500 to-orange-400" />
											<span className="text-gray-400">Fair (O(n²))</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-3 rounded bg-gradient-to-r from-red-500 to-red-400" />
											<span className="text-gray-400">
												Poor (O(n³), O(2^n))
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-3 rounded bg-gray-600" />
											<span className="text-gray-400">Previous matches</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

				{/* Charts Grid - Solution Time in Teal */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Time Performance Chart */}
					<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md border border-gray-700">
						<h3 className="text-xl font-semibold mb-4 flex items-center">
							<Clock className="mr-2 text-[#5bc6ca]" size={20} />
							Solution Time
						</h3>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={timePerformanceData}
									layout="vertical"
									margin={{ top: 5, right: 30, left: 70, bottom: 10 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="#444" />
									<XAxis
										type="number"
										stroke="#999"
										domain={[0, "auto"]}
										label={{
											value: "Time (seconds)",
											position: "insideBottom",
											offset: -5,
											fill: "#999",
										}}
									/>
									<YAxis dataKey="name" type="category" stroke="#999" />
									<Tooltip
										contentStyle={{
											backgroundColor: "#2c2c2c",
											borderColor: "#5bc6ca",
											color: "white",
										}}
										formatter={(value, name) => {
											const entry = timePerformanceData.find(
												(d: any) => d.time === value
											);
											return [entry?.formattedTime || value, "Time"];
										}}
									/>
									<Bar dataKey="time" name="Time" radius={[0, 4, 4, 0]}>
										{timePerformanceData.map((entry: any, index: number) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Test Pass Rate Chart */}
					<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md border border-gray-700">
						<h3 className="text-xl font-semibold mb-4 flex items-center">
							<Code className="mr-2 text-[#5bc6ca]" size={20} />
							Test Pass Rate
						</h3>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={codeQualityData}
									layout="vertical"
									margin={{ top: 5, right: 30, left: 70, bottom: 10 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="#444" />
									<XAxis
										type="number"
										stroke="#999"
										domain={[0, 100]}
										label={{
											value: "Pass Rate %",
											position: "insideBottom",
											offset: -5,
											fill: "#999",
										}}
									/>
									<YAxis dataKey="name" type="category" stroke="#999" />
									<Tooltip
										contentStyle={{
											backgroundColor: "#2c2c2c",
											borderColor: "#5bc6ca",
											color: "white",
										}}
										formatter={(value) => [`${value}%`, "Pass Rate"]}
									/>
									<Bar dataKey="score" name="Pass Rate" radius={[0, 4, 4, 0]}>
										{codeQualityData.map((entry: any, index: number) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Understanding Metrics Legend */}
				<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md border border-gray-700">
					<h3 className="text-lg font-semibold mb-4 flex items-center">
						<Award className="mr-2 text-[#5bc6ca]" size={20} />
						Understanding the Metrics
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
						<div className="flex items-start gap-2">
							<Clock
								size={16}
								className="text-[#5bc6ca] mt-0.5 flex-shrink-0"
							/>
							<div>
								<span className="text-gray-300 font-medium">Time:</span>
								<span className="text-gray-400 ml-1">
									How long it took to submit the solution (MM:SS format)
								</span>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<CheckCircle
								size={16}
								className="text-[#5bc6ca] mt-0.5 flex-shrink-0"
							/>
							<div>
								<span className="text-gray-300 font-medium">Tests Passed:</span>
								<span className="text-gray-400 ml-1">
									Number of test cases successfully passed
								</span>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<Zap size={16} className="text-[#5bc6ca] mt-0.5 flex-shrink-0" />
							<div>
								<span className="text-gray-300 font-medium">
									Time Complexity:
								</span>
								<span className="text-gray-400 ml-1">
									Big-O notation for algorithm efficiency (e.g., O(n), O(log n))
								</span>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<Code size={16} className="text-[#5bc6ca] mt-0.5 flex-shrink-0" />
							<div>
								<span className="text-gray-300 font-medium">
									Space Complexity:
								</span>
								<span className="text-gray-400 ml-1">
									Memory usage of the algorithm (e.g., O(1), O(n))
								</span>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<Trophy
								size={16}
								className="text-[#5bc6ca] mt-0.5 flex-shrink-0"
							/>
							<div>
								<span className="text-gray-300 font-medium">
									Rating Change:
								</span>
								<span className="text-gray-400 ml-1">
									ELO rating points gained or lost based on performance
								</span>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
