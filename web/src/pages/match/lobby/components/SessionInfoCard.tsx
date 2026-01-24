import { Code, Clock } from "lucide-react";
import type { Session } from "../../../../types/database";

interface SessionInfoCardProps {
	session: Session;
	isCollaboration: boolean;
}

export const SessionInfoCard = ({
	session,
	isCollaboration,
}: SessionInfoCardProps) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
			<div className="bg-[#2a2a2a] rounded-lg p-4">
				<div className="flex items-center text-gray-400 mb-1">
					<Code size={16} className="mr-2" />
					<span className="text-sm">
						{isCollaboration ? "Project" : "Problem"}
					</span>
				</div>
				<p className="text-white font-medium truncate">
					{session.problem?.title || "Loading..."}
				</p>
			</div>
			<div className="bg-[#2a2a2a] rounded-lg p-4">
				<div className="flex items-center text-gray-400 mb-1">
					<Clock size={16} className="mr-2" />
					<span className="text-sm">Time Limit</span>
				</div>
				<p className="text-white font-medium">{session.time_limit} minutes</p>
			</div>
			<div className="bg-[#2a2a2a] rounded-lg p-4">
				<div className="flex items-center text-gray-400 mb-1">
					<Code size={16} className="mr-2" />
					<span className="text-sm">Language</span>
				</div>
				<p className="text-white font-medium capitalize">{session.language}</p>
			</div>
		</div>
	);
};
