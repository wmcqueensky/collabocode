import { Trophy, Target, Users } from "lucide-react";
import type { UserStats } from "../types";
import { StatSkeleton } from "./StatSkeleton";

interface UserStatsDisplayProps {
	statsLoading: boolean;
	userStats: UserStats;
	totalSolved: number;
}

export const UserStatsDisplay = ({
	statsLoading,
	userStats,
	totalSolved,
}: UserStatsDisplayProps) => {
	return (
		<div className="hidden lg:flex items-center space-x-3 mr-2">
			{/* Match Rating */}
			{statsLoading ? (
				<StatSkeleton />
			) : (
				<div
					className="flex items-center space-x-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-50"
					title="Match Rating"
				>
					<Trophy size={16} className="text-yellow-500" />
					<span className="text-sm font-semibold text-gray-900">
						{userStats.matchRating}
					</span>
					<span className="text-xs text-gray-500">Match</span>
				</div>
			)}

			{/* Collaboration Rating */}
			{statsLoading ? (
				<StatSkeleton />
			) : (
				<div
					className="flex items-center space-x-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-all duration-300 hover:border-purple-400 hover:bg-purple-50"
					title="Collaboration Rating"
				>
					<Users size={16} className="text-purple-500" />
					<span className="text-sm font-semibold text-gray-900">
						{userStats.collaborationRating}
					</span>
					<span className="text-xs text-gray-500">Collab</span>
				</div>
			)}

			{/* Problems Solved */}
			{statsLoading ? (
				<StatSkeleton />
			) : (
				<div
					className="flex items-center space-x-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-all duration-300 hover:border-sky-400 hover:bg-sky-50"
					title={`Match: ${userStats.matchSolved} | Collab: ${userStats.collaborationSolved}`}
				>
					<Target size={16} className="text-sky-600" />
					<span className="text-sm font-semibold text-gray-900">
						{totalSolved}
					</span>
					<span className="text-xs text-gray-500">solved</span>
				</div>
			)}
		</div>
	);
};
