import { Trophy } from "lucide-react";

import SessionHistoryItem from "./SessionHistoryItem";
import type { SessionHistory } from "../types";

interface MatchHistoryTabProps {
	history: SessionHistory[];
	currentUserId?: string;
	onSessionClick: (sessionId: string) => void;
}

const MatchHistoryTab = ({
	history,
	currentUserId,
	onSessionClick,
}: MatchHistoryTabProps) => {
	if (history.length === 0) {
		return (
			<div>
				<h3 className="text-lg font-semibold mb-4">Match History</h3>
				<div className="text-center py-12">
					<Trophy size={48} className="text-gray-600 mx-auto mb-4" />
					<p className="text-gray-400 mb-2">No match history yet</p>
					<p className="text-sm text-gray-500">
						Start competing to see your match history here
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<h3 className="text-lg font-semibold mb-4">Match History</h3>
			<div className="space-y-3">
				{history.map((session) => (
					<SessionHistoryItem
						key={session.id}
						session={session}
						type="match"
						currentUserId={currentUserId}
						onClick={() => onSessionClick(session.session_id)}
					/>
				))}
			</div>
		</div>
	);
};

export default MatchHistoryTab;
