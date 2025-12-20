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

export default function MatchSummaryPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [summaryData, setSummaryData] = useState<any>(null);
	const [accessError, setAccessError] = useState<string | null>(null);

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
		} catch (error) {
			console.error("Error loading match summary:", error);
			setAccessError("Failed to load match summary");
		} finally {
			setLoading(false);
		}
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

	// Prepare time performance data with MM:SS format
	const timePerformanceData = summaryData.players
		.filter((p: any) => p.timeToSolve > 0)
		.map((player: any) => ({
			name: player.name,
			time: player.timeToSolve,
			formattedTime: player.formattedTime,
			fill:
				player.timeToSolve <= 900 // 15 minutes
					? "#6BCB77"
					: player.timeToSolve <= 1200 // 20 minutes
					? "#FFD93D"
					: player.timeToSolve <= 1500 // 25 minutes
					? "#ffa726"
					: "#FF6B6B",
		}))
		.sort((a: any, b: any) => a.time - b.time);

	// Prepare code quality data
	const codeQualityData = summaryData.players
		.map((player: any) => ({
			name: player.name,
			score: player.codeQualityScore,
			fill:
				player.codeQualityScore >= 90
					? "#6BCB77"
					: player.codeQualityScore >= 85
					? "#FFD93D"
					: player.codeQualityScore >= 80
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
			<main className="container mx-auto py-6 px-4">
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

				{/* Leaderboard */}
				<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md mb-6 border border-gray-700">
					<h3 className="text-xl font-semibold mb-4 flex items-center">
						<Trophy className="mr-2 text-[#5bc6ca]" size={20} />
						Leaderboard
					</h3>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="text-gray-400 border-b border-gray-600">
									<th className="py-2 px-3 text-left">Rank</th>
									<th className="py-2 px-3 text-left">Player</th>
									<th className="py-2 px-3 text-center">Time</th>
									<th className="py-2 px-3 text-center">Tests Passed</th>
									<th className="py-2 px-3 text-center">Complexity</th>
									<th className="py-2 px-3 text-center">Rating Change</th>
								</tr>
							</thead>
							<tbody>
								{summaryData.players.map((player: any, index: number) => (
									<tr
										key={index}
										className={
											index === 0
												? "bg-[#5bc6ca]/20 border-b border-gray-600"
												: "border-b border-gray-600"
										}
									>
										<td className="py-3 px-3">
											<div className="flex items-center">
												{index === 0 && (
													<Trophy size={16} className="text-[#FFD93D] mr-1" />
												)}
												{index === 1 && (
													<Trophy size={16} className="text-gray-300 mr-1" />
												)}
												{index === 2 && (
													<Trophy size={16} className="text-amber-700 mr-1" />
												)}
												{index > 2 && (
													<span className="w-4 inline-block"></span>
												)}
												<span>{player.rank}</span>
											</div>
										</td>
										<td className="py-3 px-3">
											<div className="flex items-center">
												<div
													className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs font-medium ${player.textColor}`}
													style={{ backgroundColor: player.bgColor }}
												>
													{player.initial}
												</div>
												<span className="font-medium">{player.name}</span>
											</div>
										</td>
										<td className="py-3 px-3 text-center">
											{player.formattedTime !== "0:00" ? (
												<span className="font-mono">
													{player.formattedTime}
												</span>
											) : (
												"N/A"
											)}
										</td>
										<td className="py-3 px-3 text-center">
											<div className="flex flex-col items-center">
												<span
													className={
														player.passedTestCases === 100
															? "text-[#6BCB77] font-medium"
															: "text-yellow-400 font-medium"
													}
												>
													{player.passedTestCases}%
												</span>
												<span className="text-xs text-gray-500">
													{player.passedTestCount}/{player.totalTestCount}
												</span>
											</div>
										</td>
										<td className="py-3 px-3 text-center">
											<div className="flex flex-col items-center text-xs">
												<span className="text-yellow-400">
													T: {player.timeComplexity}
												</span>
												<span className="text-green-400">
													S: {player.spaceComplexity}
												</span>
											</div>
										</td>
										<td className="py-3 px-3 text-center">
											<div className="flex flex-col items-center">
												<span
													className={
														player.ratingChange > 0
															? "text-green-400 font-medium"
															: "text-red-400 font-medium"
													}
												>
													{player.ratingChange > 0 ? "+" : ""}
													{player.ratingChange}
												</span>
												<span className="text-xs text-gray-500">
													{player.previousRating} → {player.currentRating}
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
							<Zap className="text-[#FFD93D]" size={20} />
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
							<Trophy className="text-[#6BCB77]" size={20} />
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

				{/* Charts Grid */}
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
											borderColor: "#555",
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
											borderColor: "#555",
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

				{/* Performance Comparison Table */}
				<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md mb-6 border border-gray-700">
					<h3 className="text-xl font-semibold mb-4 flex items-center">
						<Award className="mr-2 text-[#5bc6ca]" size={20} />
						Detailed Performance Comparison
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
																: player.passedTestCases >= 50
																? "bg-[#FFD93D]"
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
																: "text-yellow-400"
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
											<span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full font-mono text-sm">
												{player.timeComplexity}
											</span>
										</td>

										{/* Space Complexity */}
										<td className="py-4 px-4 text-center">
											<span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-mono text-sm">
												{player.spaceComplexity}
											</span>
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

					{/* Legend */}
					<div className="mt-6 pt-6 border-t border-gray-700">
						<h4 className="text-sm font-medium text-gray-300 mb-3">
							Understanding the Metrics:
						</h4>
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
									<span className="text-gray-300 font-medium">
										Tests Passed:
									</span>
									<span className="text-gray-400 ml-1">
										Number of test cases successfully passed
									</span>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<Zap
									size={16}
									className="text-[#5bc6ca] mt-0.5 flex-shrink-0"
								/>
								<div>
									<span className="text-gray-300 font-medium">
										Time Complexity:
									</span>
									<span className="text-gray-400 ml-1">
										Big-O notation for algorithm efficiency (e.g., O(n), O(log
										n))
									</span>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<Code
									size={16}
									className="text-[#5bc6ca] mt-0.5 flex-shrink-0"
								/>
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
										Correctness:
									</span>
									<span className="text-gray-400 ml-1">
										Whether all test cases passed successfully
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
