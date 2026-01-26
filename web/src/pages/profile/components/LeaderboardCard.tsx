import { Trophy, Users, Crown, Medal } from "lucide-react";

import type { LeaderboardEntry } from "../types";

interface LeaderboardCardProps {
	type: "match" | "collaboration";
	entries: LeaderboardEntry[];
	currentUserId?: string;
}

const LeaderboardCard = ({
	type,
	entries,
	currentUserId,
}: LeaderboardCardProps) => {
	const isMatch = type === "match";

	const getRankDisplay = (rank: number) => {
		if (rank === 1) return <Crown size={16} className="text-yellow-500" />;
		if (rank === 2) return <Medal size={16} className="text-gray-400" />;
		if (rank === 3) return <Medal size={16} className="text-amber-600" />;
		return (
			<span className="text-gray-500 text-sm font-mono w-4 text-center">
				{rank}
			</span>
		);
	};

	const headerGradient = isMatch
		? "from-yellow-50 to-orange-50"
		: "from-purple-50 to-pink-50";

	const avatarBg = isMatch ? "bg-sky-600" : "bg-purple-600";
	const ratingColor = isMatch ? "text-yellow-600" : "text-purple-600";

	return (
		<div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
			<div
				className={`bg-gradient-to-r ${headerGradient} px-4 py-3 border-b border-gray-200`}
			>
				<h4 className="font-semibold text-gray-900 flex items-center">
					{isMatch ? (
						<Trophy size={16} className="mr-2 text-yellow-500" />
					) : (
						<Users size={16} className="mr-2 text-purple-600" />
					)}
					{isMatch ? "Match Ranking" : "Collaboration Ranking"}
				</h4>
			</div>
			<div className="divide-y divide-gray-200">
				{entries.length === 0 ? (
					<div className="p-4 text-center text-gray-500 text-sm">
						No data available
					</div>
				) : (
					entries.map((entry) => {
						const isCurrentUser = entry.id === currentUserId;
						const bgColor = isCurrentUser
							? isMatch
								? "bg-yellow-50"
								: "bg-purple-50"
							: "";
						const textColor = isCurrentUser
							? isMatch
								? "text-yellow-600"
								: "text-purple-600"
							: "text-gray-900";

						return (
							<div
								key={entry.id}
								className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${bgColor}`}
							>
								<div className="flex items-center space-x-3">
									<div className="w-6 flex justify-center">
										{getRankDisplay(entry.rank)}
									</div>
									<div
										className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-sm font-medium text-white`}
									>
										{entry.username[0]?.toUpperCase() || "?"}
									</div>
									<span className={`font-medium ${textColor}`}>
										{entry.username}
										{isCurrentUser && (
											<span className="text-xs text-gray-500 ml-1">(you)</span>
										)}
									</span>
								</div>
								<div className="flex items-center space-x-4">
									<div className="text-right">
										<p className={`font-semibold ${ratingColor}`}>
											{entry.rating}
										</p>
										<p className="text-xs text-gray-500">
											{entry.solved} solved
										</p>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default LeaderboardCard;
