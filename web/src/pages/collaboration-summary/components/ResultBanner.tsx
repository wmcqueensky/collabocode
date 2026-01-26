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
					? "bg-green-50 border-green-200"
					: "bg-red-50 border-red-200"
			}`}
		>
			<div className="flex justify-center mb-4">
				{teamEvaluation.isCorrect ? (
					<div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-100">
						<Trophy className="text-green-600" size={40} />
					</div>
				) : (
					<div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-100">
						<XCircle className="text-red-600" size={40} />
					</div>
				)}
			</div>
			<h2 className="text-2xl font-bold mb-2 text-gray-900">
				{teamEvaluation.isCorrect ? "Problem Solved! 🎉" : "Not Quite There 💪"}
			</h2>
			<p className="text-lg text-gray-700">
				Problem:{" "}
				<span className="font-semibold text-purple-600">
					{session.problem?.title}
				</span>{" "}
				({session.problem?.difficulty})
			</p>
			<p className="text-sm text-gray-600 mt-2">
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
