import { Trophy, Users, ExternalLink } from "lucide-react";

import { formatDate, formatParticipants } from "../constants";
import type { SessionHistory } from "../types";

interface SessionHistoryItemProps {
	session: SessionHistory;
	type: "match" | "collaboration";
	currentUserId?: string;
	onClick: () => void;
}

const SessionHistoryItem = ({
	session,
	type,
	currentUserId,
	onClick,
}: SessionHistoryItemProps) => {
	const isCollaboration = type === "collaboration";

	const getTypeIcon = () => {
		return isCollaboration ? (
			<Users size={14} className="text-[#a78bfa]" />
		) : (
			<Trophy size={14} className="text-yellow-500" />
		);
	};

	const getResultBadge = (ranking: number) => {
		if (isCollaboration) {
			return (
				<span className="px-2 py-1 bg-purple-500 bg-opacity-10 text-purple-500 rounded-full text-xs font-medium">
					Collaboration
				</span>
			);
		}
		if (ranking === 1) {
			return (
				<span className="px-2 py-1 bg-green-500 bg-opacity-10 text-green-500 rounded-full text-xs font-medium">
					1st Place
				</span>
			);
		}
		if (ranking === 2) {
			return (
				<span className="px-2 py-1 bg-blue-500 bg-opacity-10 text-blue-500 rounded-full text-xs font-medium">
					2nd Place
				</span>
			);
		}
		if (ranking === 3) {
			return (
				<span className="px-2 py-1 bg-orange-500 bg-opacity-10 text-orange-500 rounded-full text-xs font-medium">
					3rd Place
				</span>
			);
		}
		return (
			<span className="px-2 py-1 bg-gray-500 bg-opacity-10 text-gray-400 rounded-full text-xs font-medium">
				{ranking}th Place
			</span>
		);
	};

	const borderHoverColor = isCollaboration
		? "hover:border-[#a78bfa]"
		: "hover:border-[#5bc6ca]";

	return (
		<div
			onClick={onClick}
			className={`bg-[#252525] rounded-lg border border-gray-700 p-4 ${borderHoverColor} hover:bg-[#2a2a2a] transition-all cursor-pointer`}
		>
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
				<div className="flex-1">
					<div className="flex items-center space-x-2 mb-1">
						{getTypeIcon()}
						<h4 className="font-medium">{session.problem_title}</h4>
					</div>
					<div className="flex items-center space-x-3 text-sm text-gray-400">
						<span>{formatDate(session.created_at)}</span>
						<span className="text-gray-600">•</span>
						<span className="flex items-center">
							<Users
								size={12}
								className={`mr-1 ${isCollaboration ? "text-[#a78bfa]" : ""}`}
							/>
							{formatParticipants(session.participants, currentUserId)}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-4">
					{isCollaboration ? (
						session.completed || session.rating_change || session.ranking ? (
							<>
								{getResultBadge(session.ranking)}
								<div
									className={`text-sm font-medium ${
										(session.rating_change || 0) >= 0
											? "text-green-500"
											: "text-red-500"
									}`}
								>
									{(session.rating_change || 0) >= 0 ? "+" : ""}
									{session.rating_change || 0}
								</div>
							</>
						) : (
							<span className="px-2 py-1 bg-gray-500 bg-opacity-10 text-gray-400 rounded-full text-xs font-medium">
								Incomplete
							</span>
						)
					) : (
						<>
							{getResultBadge(session.ranking)}
							<div
								className={`text-sm font-medium ${
									(session.rating_change || 0) >= 0
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{(session.rating_change || 0) >= 0 ? "+" : ""}
								{session.rating_change || 0} ELO
							</div>
							{!session.completed &&
								!session.rating_change &&
								!session.ranking && (
									<span className="px-2 py-1 bg-gray-500 bg-opacity-10 text-gray-400 rounded-full text-xs font-medium">
										In Progress
									</span>
								)}
						</>
					)}
					<ExternalLink size={16} className="text-gray-500" />
				</div>
			</div>
		</div>
	);
};

export default SessionHistoryItem;
