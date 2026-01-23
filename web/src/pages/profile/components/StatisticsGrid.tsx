import { Target, Flame, Award, CheckCircle, Trophy, Users } from "lucide-react";

import type { Statistics } from "../types";

interface StatisticsGridProps {
	statistics: Statistics;
	totalSolved: number;
	matchSolved: number;
	collaborationSolved: number;
}

const StatisticsGrid = ({
	statistics,
	totalSolved,
	matchSolved,
	collaborationSolved,
}: StatisticsGridProps) => {
	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
			<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
				<div className="flex items-center space-x-2 mb-2">
					<Target className="text-[#5bc6ca]" size={20} />
					<span className="text-gray-400 text-sm">Total Solved</span>
				</div>
				<p className="text-2xl font-bold">{totalSolved}</p>
				<p className="text-xs text-gray-500">
					M: {matchSolved} | C: {collaborationSolved}
				</p>
			</div>

			<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
				<div className="flex items-center space-x-2 mb-2">
					<Flame className="text-orange-500" size={20} />
					<span className="text-gray-400 text-sm">Current Streak</span>
				</div>
				<p className="text-2xl font-bold">{statistics.currentStreak}</p>
			</div>

			<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
				<div className="flex items-center space-x-2 mb-2">
					<Award className="text-yellow-500" size={20} />
					<span className="text-gray-400 text-sm">Match Win Rate</span>
				</div>
				<p className="text-2xl font-bold">
					{statistics.matchWinRate.toFixed(1)}%
				</p>
				<p className="text-xs text-gray-500">
					{statistics.matchWins}W / {statistics.matchLosses}L
				</p>
			</div>

			<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
				<div className="flex items-center space-x-2 mb-2">
					<CheckCircle className="text-[#a78bfa]" size={20} />
					<span className="text-gray-400 text-sm">Collab Success</span>
				</div>
				<p className="text-2xl font-bold">
					{statistics.collaborationSuccessRate.toFixed(1)}%
				</p>
				<p className="text-xs text-gray-500">
					{statistics.collaborationSuccesses} successful
				</p>
			</div>

			<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
				<div className="flex items-center space-x-2 mb-2">
					<Trophy className="text-yellow-500" size={20} />
					<span className="text-gray-400 text-sm">Total Matches</span>
				</div>
				<p className="text-2xl font-bold">{statistics.totalMatches}</p>
			</div>

			<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
				<div className="flex items-center space-x-2 mb-2">
					<Users className="text-[#a78bfa]" size={20} />
					<span className="text-gray-400 text-sm">Collaborations</span>
				</div>
				<p className="text-2xl font-bold">{statistics.totalCollaborations}</p>
			</div>
		</div>
	);
};

export default StatisticsGrid;
