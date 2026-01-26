import { Users } from "lucide-react";

import SessionHistoryItem from "./SessionHistoryItem";
import type { SessionHistory } from "../types";

interface CollaborationHistoryTabProps {
	history: SessionHistory[];
	currentUserId?: string;
	onSessionClick: (sessionId: string) => void;
}

const CollaborationHistoryTab = ({
	history,
	currentUserId,
	onSessionClick,
}: CollaborationHistoryTabProps) => {
	if (history.length === 0) {
		return (
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Collaboration History
				</h3>
				<div className="text-center py-12">
					<Users size={48} className="text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 mb-2">No collaboration history yet</p>
					<p className="text-sm text-gray-500">
						Start collaborating to see your history here
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Collaboration History
			</h3>
			<div className="space-y-3">
				{history.map((session) => (
					<SessionHistoryItem
						key={session.id}
						session={session}
						type="collaboration"
						currentUserId={currentUserId}
						onClick={() => onSessionClick(session.session_id)}
					/>
				))}
			</div>
		</div>
	);
};

export default CollaborationHistoryTab;
