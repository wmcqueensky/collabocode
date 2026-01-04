import { Users, Crown, Eye } from "lucide-react";
import type { SessionParticipant } from "../../../types/database";

interface CollaboratorsListProps {
	participants: SessionParticipant[];
	currentUserId: string;
	isMobile?: boolean;
}

export const CollaboratorsList = ({
	participants,
	currentUserId,
	isMobile = false,
}: CollaboratorsListProps) => {
	// Get avatar color based on user id
	const getAvatarColor = (userId: string, index: number) => {
		const colors = [
			"bg-[#FF6B6B]",
			"bg-[#FFD93D]",
			"bg-[#6BCB77]",
			"bg-[#e44dff]",
			"bg-[#5bc6ca]",
			"bg-[#FF8E53]",
		];
		return colors[index % colors.length];
	};

	const getTextColor = (index: number) => {
		const lightBg = [1, 2]; // Indices with light backgrounds
		return lightBg.includes(index % 6) ? "text-gray-900" : "text-white";
	};

	const joinedParticipants = participants.filter((p) => p.status === "joined");

	if (isMobile) {
		// Compact mobile view - just avatars
		return (
			<div className="flex items-center space-x-1">
				<div className="flex -space-x-2">
					{joinedParticipants.slice(0, 4).map((participant, index) => (
						<div
							key={participant.id}
							className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 border-[#2c2c2c] ${getAvatarColor(
								participant.user_id,
								index
							)} ${getTextColor(index)}`}
							title={participant.user?.username || "User"}
						>
							{participant.user?.username?.charAt(0).toUpperCase() || "?"}
						</div>
					))}
					{joinedParticipants.length > 4 && (
						<div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 border-[#2c2c2c] bg-gray-600 text-white">
							+{joinedParticipants.length - 4}
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-[#252525] rounded-lg border border-gray-700 overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
				<div className="flex items-center space-x-2">
					<Users size={16} className="text-purple-500" />
					<span className="text-sm font-medium text-gray-300">
						Collaborators
					</span>
				</div>
				<span className="text-xs text-gray-500">
					{joinedParticipants.length} online
				</span>
			</div>

			{/* Participants List */}
			<div className="p-2 space-y-1 max-h-48 overflow-y-auto">
				{joinedParticipants.map((participant, index) => {
					const isCurrentUser = participant.user_id === currentUserId;
					const isHost = participant.role === "host";
					const isViewer = participant.role === "viewer";

					return (
						<div
							key={participant.id}
							className={`flex items-center justify-between p-2 rounded-lg ${
								isCurrentUser ? "bg-purple-500/10" : "hover:bg-gray-700/50"
							}`}
						>
							<div className="flex items-center space-x-2">
								{/* Avatar */}
								<div className="relative">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(
											participant.user_id,
											index
										)} ${getTextColor(index)}`}
									>
										{participant.user?.username?.charAt(0).toUpperCase() || "?"}
									</div>
									{/* Online indicator */}
									<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#252525]" />
								</div>

								{/* Name and role */}
								<div className="min-w-0">
									<div className="flex items-center space-x-1">
										<span
											className={`text-sm font-medium truncate ${
												isCurrentUser ? "text-purple-400" : "text-gray-200"
											}`}
										>
											{participant.user?.username || "Unknown"}
										</span>
										{isCurrentUser && (
											<span className="text-xs text-gray-500">(you)</span>
										)}
									</div>
									{/* Rating */}
									<div className="text-xs text-gray-500">
										⭐{" "}
										{participant.user?.collaboration_rating ||
											participant.user?.rating ||
											1500}
									</div>
								</div>
							</div>

							{/* Role badge */}
							{isHost && (
								<div className="flex items-center space-x-1 text-xs text-yellow-500">
									<Crown size={12} />
									<span>Host</span>
								</div>
							)}
							{isViewer && (
								<div className="flex items-center space-x-1 text-xs text-gray-400">
									<Eye size={12} />
									<span>Viewer</span>
								</div>
							)}
						</div>
					);
				})}

				{joinedParticipants.length === 0 && (
					<div className="text-center py-4 text-gray-500 text-sm">
						No collaborators yet
					</div>
				)}
			</div>
		</div>
	);
};

export default CollaboratorsList;
