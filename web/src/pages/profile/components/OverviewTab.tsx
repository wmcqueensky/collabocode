import { Trophy, Users, Crown } from "lucide-react";

import LeaderboardCard from "./LeaderboardCard";
import type { Statistics, Leaderboards } from "../types";

interface OverviewTabProps {
	statistics: Statistics;
	matchRating: number;
	collaborationRating: number;
	collaborationSolved: number;
	leaderboards: Leaderboards;
	currentUserId?: string;
}

const OverviewTab = ({
	statistics,
	matchRating,
	collaborationRating,
	collaborationSolved,
	leaderboards,
	currentUserId,
}: OverviewTabProps) => {
	return (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-3">Performance Overview</h3>
			<p className="text-gray-400 mb-4">
				Track your progress across both competitive matches and collaborative
				sessions.
			</p>

			{/* Performance Cards */}
			<div className="grid md:grid-cols-2 gap-4">
				<div className="bg-[#252525] rounded-lg border border-gray-700 p-4">
					<div className="flex items-center justify-between mb-3">
						<span className="text-gray-400">Match Performance</span>
						<Trophy className="text-yellow-500" size={20} />
					</div>
					<p className="text-2xl font-bold text-green-500">
						{statistics.matchWins} Wins
					</p>
					<p className="text-sm text-gray-500 mt-1">
						{statistics.matchLosses} losses • {matchRating} ELO
					</p>
				</div>

				<div className="bg-[#252525] rounded-lg border border-gray-700 p-4">
					<div className="flex items-center justify-between mb-3">
						<span className="text-gray-400">Collaboration Activity</span>
						<Users className="text-[#a78bfa]" size={20} />
					</div>
					<p className="text-2xl font-bold text-[#a78bfa]">
						{statistics.totalCollaborations} Sessions
					</p>
					<p className="text-sm text-gray-500 mt-1">
						{collaborationSolved} problems solved • {collaborationRating} rating
					</p>
				</div>
			</div>

			{/* Leaderboards Section */}
			<div className="mt-8">
				<h3 className="text-lg font-semibold mb-4 flex items-center">
					<Crown size={20} className="mr-2 text-yellow-500" />
					Leaderboards
				</h3>
				<div className="grid md:grid-cols-2 gap-6">
					<LeaderboardCard
						type="match"
						entries={leaderboards.match}
						currentUserId={currentUserId}
					/>
					<LeaderboardCard
						type="collaboration"
						entries={leaderboards.collaboration}
						currentUserId={currentUserId}
					/>
				</div>
			</div>
		</div>
	);
};

export default OverviewTab;
