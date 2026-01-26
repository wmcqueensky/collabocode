import { CheckCircle, Zap, Trophy } from "lucide-react";
import type { PlayerData } from "../utils/types";

interface StatsGridProps {
	players: PlayerData[];
	winner: string;
	winnerTime: string;
}

export default function StatsGrid({
	players,
	winner,
	winnerTime,
}: StatsGridProps) {
	const avgPassedTests =
		players.reduce((sum, p) => sum + p.passedTestCount, 0) / players.length;
	const avgTotalTests =
		players.reduce((sum, p) => sum + p.totalTestCount, 0) / players.length;
	const completionRate = Math.round(
		(players.filter((p) => p.isCorrect).length / players.length) * 100,
	);
	const solvedCount = players.filter((p) => p.isCorrect).length;

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
			{/* Average Test Pass Rate Per User */}
			<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<div className="flex items-center justify-between mb-2">
					<h4 className="text-sm text-gray-500">Avg Tests Per User</h4>
					<CheckCircle className="text-sky-600" size={20} />
				</div>
				<div className="text-3xl font-bold text-gray-900">
					{avgPassedTests.toFixed(1)} / {avgTotalTests.toFixed(1)}
				</div>
				<div className="text-xs text-gray-500 mt-1">
					tests solved per player on average
				</div>
			</div>

			{/* Fastest Solution */}
			<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<div className="flex items-center justify-between mb-2">
					<h4 className="text-sm text-gray-500">Fastest Solution</h4>
					<Zap className="text-sky-600" size={20} />
				</div>
				<div className="text-3xl font-bold text-gray-900 font-mono">
					{winnerTime}
				</div>
				<div className="text-xs text-gray-500 mt-1">by {winner}</div>
			</div>

			{/* Success Rate */}
			<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<div className="flex items-center justify-between mb-2">
					<h4 className="text-sm text-gray-500">Completion Rate</h4>
					<Trophy className="text-sky-600" size={20} />
				</div>
				<div className="text-3xl font-bold text-gray-900">
					{completionRate}%
				</div>
				<div className="text-xs text-gray-500 mt-1">
					{solvedCount} / {players.length} solved correctly
				</div>
			</div>
		</div>
	);
}
