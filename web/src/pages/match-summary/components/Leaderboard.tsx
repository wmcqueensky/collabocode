import { Trophy, Clock, CheckCircle, Zap, Code } from "lucide-react";
import type { PlayerData } from "../utils/types";
import {
	getTimeComplexityColor,
	getSpaceComplexityColor,
} from "../utils/helpers";

interface LeaderboardProps {
	players: PlayerData[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
	return (
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
						{players.map((player, index) => (
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
									<span
										className={`inline-block px-3 py-1 rounded-full font-mono text-sm ${getTimeComplexityColor(
											player.timeComplexity,
										)}`}
									>
										{player.timeComplexity}
									</span>
								</td>

								{/* Space Complexity */}
								<td className="py-4 px-4 text-center">
									<span
										className={`inline-block px-3 py-1 rounded-full font-mono text-sm ${getSpaceComplexityColor(
											player.spaceComplexity,
										)}`}
									>
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
		</div>
	);
}
