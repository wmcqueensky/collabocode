import { useState, useEffect } from "react";
import {
	ArrowLeft,
	Award,
	Clock,
	Code,
	Trophy,
	User,
	AlertTriangle,
	Cpu,
	Loader2,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
	Cell,
} from "recharts";
import { useParams, useNavigate } from "react-router-dom";
import { matchService } from "../../services/matchService";
import { sessionService } from "../../services/sessionService";

const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#e44dff"];
const RADAR_COLORS = [
	"rgba(255, 107, 107, 0.6)",
	"rgba(255, 217, 61, 0.6)",
	"rgba(107, 203, 119, 0.6)",
	"rgba(228, 77, 255, 0.6)",
];

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

	// const complexityColors: Record<string, string> = {
	// 	"O(1)": "text-green-400",
	// 	"O(log n)": "text-green-400",
	// 	"O(n)": "text-yellow-400",
	// 	"O(n log n)": "text-yellow-400",
	// 	"O(n²)": "text-orange-400",
	// 	"O(2^n)": "text-red-400",
	// 	"O(n!)": "text-red-500",
	// };

	const timePerformanceData = summaryData.players
		.map((player: any) => ({
			name: player.name,
			time: player.timeToSolve,
			fill:
				player.timeToSolve <= 15
					? "#6BCB77"
					: player.timeToSolve <= 20
					? "#FFD93D"
					: player.timeToSolve <= 25
					? "#ffa726"
					: "#FF6B6B",
		}))
		.sort((a: any, b: any) => a.time - b.time);

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

	const radarChartData = [
		{
			subject: "Speed",
			...summaryData.players.reduce((acc: any, player: any, idx: number) => {
				acc[String.fromCharCode(65 + idx)] =
					player.timeToSolve > 0
						? Math.max(0, 100 - player.timeToSolve * 3)
						: 0;
				return acc;
			}, {}),
			fullMark: 100,
		},
		{
			subject: "Test Coverage",
			...summaryData.players.reduce((acc: any, player: any, idx: number) => {
				acc[String.fromCharCode(65 + idx)] = player.passedTestCases;
				return acc;
			}, {}),
			fullMark: 100,
		},
		{
			subject: "Code Quality",
			...summaryData.players.reduce((acc: any, player: any, idx: number) => {
				acc[String.fromCharCode(65 + idx)] = player.codeQualityScore;
				return acc;
			}, {}),
			fullMark: 100,
		},
	];

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
						{summaryData.players[0]?.timeToSolve > 0 && (
							<div className="flex items-center">
								<Clock className="text-[#5bc6ca] mr-1" size={20} />
								<span>
									Best Time: {summaryData.players[0].timeToSolve} minutes
								</span>
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
									<th className="py-2 px-3 text-center">Quality Score</th>
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
											{player.timeToSolve > 0
												? `${player.timeToSolve} mins`
												: "N/A"}
										</td>
										<td className="py-3 px-3 text-center">
											<span
												className={
													player.passedTestCases === 100
														? "text-[#6BCB77]"
														: "text-yellow-400"
												}
											>
												{player.passedTestCases}%
											</span>
										</td>
										<td className="py-3 px-3 text-center">
											<div className="w-full bg-gray-600 rounded-full h-2">
												<div
													className={`h-2 rounded-full ${
														player.codeQualityScore >= 90
															? "bg-[#6BCB77]"
															: player.codeQualityScore >= 85
															? "bg-[#FFD93D]"
															: player.codeQualityScore >= 80
															? "bg-[#ffa726]"
															: "bg-[#FF6B6B]"
													}`}
													style={{ width: `${player.codeQualityScore}%` }}
												></div>
											</div>
											<span className="text-xs">
												{Math.round(player.codeQualityScore)}/100
											</span>
										</td>
										<td className="py-3 px-3 text-center">
											<span
												className={
													player.rank === 1 ? "text-green-400" : "text-red-400"
												}
											>
												{player.rank === 1 ? "+10" : "-10"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
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
									margin={{ top: 5, right: 30, left: 50, bottom: 10 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="#444" />
									<XAxis
										type="number"
										stroke="#999"
										domain={[0, "auto"]}
										label={{
											value: "Minutes to Solve",
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
										formatter={(value) => [`${value} mins`, "Time"]}
									/>
									<Bar dataKey="time" name="Minutes" radius={[0, 4, 4, 0]}>
										{timePerformanceData.map((entry: any, index: number) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Code Quality Chart */}
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
									margin={{ top: 5, right: 30, left: 50, bottom: 10 }}
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
									<Bar dataKey="score" name="Quality" radius={[0, 4, 4, 0]}>
										{codeQualityData.map((entry: any, index: number) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Radar Chart */}
				<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md mb-6 border border-gray-700">
					<h3 className="text-xl font-semibold mb-4 flex items-center">
						<Cpu className="mr-2 text-[#5bc6ca]" size={20} />
						Performance Analysis
					</h3>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<RadarChart outerRadius={100} data={radarChartData}>
								<PolarGrid strokeDasharray="3 3" stroke="#444" />
								<PolarAngleAxis dataKey="subject" tick={{ fill: "#999" }} />
								<PolarRadiusAxis
									angle={30}
									domain={[0, 100]}
									tick={{ fill: "#999" }}
								/>
								{summaryData.players.map((player: any, idx: number) => (
									<Radar
										key={player.userId}
										name={player.name}
										dataKey={String.fromCharCode(65 + idx)}
										stroke={COLORS[idx % COLORS.length]}
										fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
										fillOpacity={0.6}
									/>
								))}
								<Legend />
								<Tooltip
									contentStyle={{
										backgroundColor: "#2c2c2c",
										borderColor: "#555",
										color: "white",
									}}
								/>
							</RadarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</main>
		</div>
	);
}
