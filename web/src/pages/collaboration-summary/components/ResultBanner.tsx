import { Trophy, XCircle } from "lucide-react";
import type { TeamEvaluation, HistoricalStats } from "../utils/types";
import { formatTime } from "../utils/utils";

interface ResultBannerProps {
	teamEvaluation: TeamEvaluation;
	session: any;
	teamMembersCount: number;
	historicalStats: HistoricalStats | null;
}

export default function ResultBanner({
	teamEvaluation,
	session,
	teamMembersCount,
	historicalStats,
}: ResultBannerProps) {
	return (
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
				{teamEvaluation.isCorrect ? "Problem Solved! 🎉" : "Not Quite There 💪"}
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
				{teamMembersCount} players • {session.time_limit} min limit
			</p>
			{historicalStats && historicalStats.totalCollaborations > 0 && (
				<p className="text-xs text-gray-500 mt-1">
					{historicalStats.totalCollaborations} previous attempts •{" "}
					{historicalStats.successRate.toFixed(0)}% success rate
				</p>
			)}
		</div>
	);
}
