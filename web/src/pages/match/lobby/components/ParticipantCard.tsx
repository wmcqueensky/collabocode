import { CheckCircle, XCircle, Loader2, Users } from "lucide-react";
import type { SessionParticipant } from "../../../../types/database";

interface ParticipantCardProps {
	participant: SessionParticipant;
	isCurrentUser: boolean;
	isHost: boolean;
	isCollaboration: boolean;
}

export const ParticipantCard = ({
	participant,
	isCurrentUser,
	isHost,
	isCollaboration,
}: ParticipantCardProps) => {
	const user = participant.user;

	// Get participant status icon
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "joined":
				return <CheckCircle size={20} className="text-green-500" />;
			case "declined":
				return <XCircle size={20} className="text-red-500" />;
			case "invited":
				return <Loader2 size={20} className="text-yellow-500 animate-spin" />;
			default:
				return <Users size={20} className="text-gray-500" />;
		}
	};

	// Get status text
	const getStatusText = (status: string) => {
		switch (status) {
			case "joined":
				return <span className="text-green-500">Ready</span>;
			case "declined":
				return <span className="text-red-500">Declined</span>;
			case "invited":
				return <span className="text-yellow-500">Waiting...</span>;
			default:
				return <span className="text-gray-500">Pending</span>;
		}
	};

	return (
		<div
			className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
				isCurrentUser
					? isCollaboration
						? "bg-purple-500/10 border-purple-500"
						: "bg-[#5bc6ca10] border-[#5bc6ca]"
					: "bg-[#2a2a2a] border-gray-700"
			}`}
		>
			<div className="flex items-center space-x-3 flex-1">
				{/* Avatar */}
				<div className="relative">
					{user?.avatar_url ? (
						<img
							src={user.avatar_url}
							alt={user.username}
							className="w-12 h-12 rounded-full object-cover"
						/>
					) : (
						<div
							className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
								isCollaboration
									? "bg-gradient-to-br from-purple-500 to-purple-600"
									: "bg-gradient-to-br from-[#5bc6ca] to-[#48aeb3]"
							}`}
						>
							{user?.username?.charAt(0).toUpperCase() || "?"}
						</div>
					)}
					{/* Status Badge */}
					<div className="absolute -bottom-1 -right-1">
						{getStatusIcon(participant.status)}
					</div>
				</div>

				{/* User Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center space-x-2">
						<p className="text-white font-medium truncate">
							{user?.username || "Unknown"}
							{isCurrentUser && (
								<span
									className={
										isCollaboration
											? "text-purple-400 ml-2"
											: "text-[#5bc6ca] ml-2"
									}
								>
									(You)
								</span>
							)}
							{isHost && (
								<span
									className={`ml-2 text-xs text-black px-2 py-0.5 rounded-full ${
										isCollaboration ? "bg-purple-500" : "bg-[#5bc6ca]"
									}`}
								>
									Host
								</span>
							)}
						</p>
					</div>
					<div className="flex items-center space-x-3 text-sm text-gray-400">
						<span>⭐ {user?.rating || 1500}</span>
						<span>🏆 {user?.problems_solved || 0}</span>
					</div>
				</div>
			</div>

			{/* Status */}
			<div className="text-right ml-4">{getStatusText(participant.status)}</div>
		</div>
	);
};
