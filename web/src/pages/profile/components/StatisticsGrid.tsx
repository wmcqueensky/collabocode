import { Target, Award, CheckCircle, Trophy, Users } from "lucide-react";

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
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
			<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
				<div className="flex items-center space-x-2 mb-2">
					<Target className="text-sky-600" size={20} />
					<span className="text-gray-600 text-sm">Total Solved</span>
				</div>
				<p className="text-2xl font-bold text-gray-900">{totalSolved}</p>
				<p className="text-xs text-gray-500">
					M: {matchSolved} | C: {collaborationSolved}
				</p>
			</div>

			<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
				<div className="flex items-center space-x-2 mb-2">
					<Award className="text-yellow-500" size={20} />
					<span className="text-gray-600 text-sm">Match Win Rate</span>
				</div>
				<p className="text-2xl font-bold text-gray-900">
					{statistics.matchWinRate.toFixed(1)}%
				</p>
				<p className="text-xs text-gray-500">
					{statistics.matchWins}W / {statistics.matchLosses}L
				</p>
			</div>

			<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
				<div className="flex items-center space-x-2 mb-2">
					<CheckCircle className="text-purple-600" size={20} />
					<span className="text-gray-600 text-sm">Collab Success</span>
				</div>
				<p className="text-2xl font-bold text-gray-900">
					{statistics.collaborationSuccessRate.toFixed(1)}%
				</p>
				<p className="text-xs text-gray-500">
					{statistics.collaborationSuccesses} successful
				</p>
			</div>

			<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
				<div className="flex items-center space-x-2 mb-2">
					<Trophy className="text-yellow-500" size={20} />
					<span className="text-gray-600 text-sm">Total Matches</span>
				</div>
				<p className="text-2xl font-bold text-gray-900">
					{statistics.totalMatches}
				</p>
			</div>

			<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
				<div className="flex items-center space-x-2 mb-2">
					<Users className="text-purple-600" size={20} />
					<span className="text-gray-600 text-sm">Collaborations</span>
				</div>
				<p className="text-2xl font-bold text-gray-900">
					{statistics.totalCollaborations}
				</p>
			</div>
		</div>
	);
};

export default StatisticsGrid;
