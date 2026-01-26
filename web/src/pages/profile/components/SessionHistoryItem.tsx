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
			<Users size={14} className="text-purple-600" />
		) : (
			<Trophy size={14} className="text-yellow-500" />
		);
	};

	const getResultBadge = (ranking: number) => {
		if (isCollaboration) {
			return (
				<span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
					Collaboration
				</span>
			);
		}
		if (ranking === 1) {
			return (
				<span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
					1st Place
				</span>
			);
		}
		if (ranking === 2) {
			return (
				<span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
					2nd Place
				</span>
			);
		}
		if (ranking === 3) {
			return (
				<span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
					3rd Place
				</span>
			);
		}
		return (
			<span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
				{ranking}th Place
			</span>
		);
	};

	const borderHoverColor = isCollaboration
		? "hover:border-purple-300"
		: "hover:border-sky-300";

	return (
		<div
			onClick={onClick}
			className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${borderHoverColor} hover:bg-white transition-all cursor-pointer`}
		>
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
				<div className="flex-1">
					<div className="flex items-center space-x-2 mb-1">
						{getTypeIcon()}
						<h4 className="font-medium text-gray-900">
							{session.problem_title}
						</h4>
					</div>
					<div className="flex items-center space-x-3 text-sm text-gray-500">
						<span>{formatDate(session.created_at)}</span>
						<span className="text-gray-400">•</span>
						<span className="flex items-center">
							<Users
								size={12}
								className={`mr-1 ${isCollaboration ? "text-purple-600" : ""}`}
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
											? "text-green-600"
											: "text-red-600"
									}`}
								>
									{(session.rating_change || 0) >= 0 ? "+" : ""}
									{session.rating_change || 0}
								</div>
							</>
						) : (
							<span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
								Incomplete
							</span>
						)
					) : (
						<>
							{getResultBadge(session.ranking)}
							<div
								className={`text-sm font-medium ${
									(session.rating_change || 0) >= 0
										? "text-green-600"
										: "text-red-600"
								}`}
							>
								{(session.rating_change || 0) >= 0 ? "+" : ""}
								{session.rating_change || 0} ELO
							</div>
							{!session.completed &&
								!session.rating_change &&
								!session.ranking && (
									<span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
										In Progress
									</span>
								)}
						</>
					)}
					<ExternalLink size={16} className="text-gray-400" />
				</div>
			</div>
		</div>
	);
};

export default SessionHistoryItem;
