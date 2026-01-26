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
					className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700 transition-all duration-300 hover:border-yellow-500/50"
					title="Match Rating"
				>
					<Trophy size={16} className="text-yellow-500" />
					<span className="text-sm font-semibold text-white">
						{userStats.matchRating}
					</span>
					<span className="text-xs text-gray-400">Match</span>
				</div>
			)}

			{/* Collaboration Rating */}
			{statsLoading ? (
				<StatSkeleton />
			) : (
				<div
					className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#8b5cf6]/50"
					title="Collaboration Rating"
				>
					<Users size={16} className="text-[#a78bfa]" />
					<span className="text-sm font-semibold text-white">
						{userStats.collaborationRating}
					</span>
					<span className="text-xs text-gray-400">Collab</span>
				</div>
			)}

			{/* Problems Solved */}
			{statsLoading ? (
				<StatSkeleton />
			) : (
				<div
					className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#5bc6ca]/50"
					title={`Match: ${userStats.matchSolved} | Collab: ${userStats.collaborationSolved}`}
				>
					<Target size={16} className="text-[#5bc6ca]" />
					<span className="text-sm font-semibold text-white">
						{totalSolved}
					</span>
					<span className="text-xs text-gray-400">solved</span>
				</div>
			)}
		</div>
	);
};
