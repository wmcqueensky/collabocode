import React from "react";
import {
	Users,
	Clock,
	Code,
	CheckCircle,
	XCircle,
	Loader2,
	Rocket,
} from "lucide-react";
import type { Session, SessionParticipant } from "../../../types/database";

interface WaitingLobbyProps {
	session: Session;
	participants: SessionParticipant[];
	currentUserId: string;
	timeElapsed: number;
	isHost: boolean;
	canStart: boolean;
	joinedCount: number;
	invitedCount: number;
	declinedCount: number;
	allPlayersJoined: boolean;
	onStartSession?: () => void;
}

// Helper function to format time
const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
};

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
			return <Users size={20} className="text-gray-400" />;
	}
};

// Get status text
const getStatusText = (status: string) => {
	switch (status) {
		case "joined":
			return <span className="text-green-600">Ready</span>;
		case "declined":
			return <span className="text-red-600">Declined</span>;
		case "invited":
			return <span className="text-yellow-600">Waiting...</span>;
		default:
			return <span className="text-gray-500">Pending</span>;
	}
};

export const WaitingLobby: React.FC<WaitingLobbyProps> = ({
	session,
	participants,
	currentUserId,
	timeElapsed,
	isHost,
	canStart,
	joinedCount,
	invitedCount,
	declinedCount,
	allPlayersJoined,
	onStartSession,
}) => {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-4xl w-full">
				{/* Main Card */}
				<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
					{/* Header */}
					<div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
						<div className="flex items-center justify-center mb-2">
							<Rocket size={32} className="text-white mr-2" />
							<h1 className="text-3xl font-bold text-white">
								Waiting for Collaborators
							</h1>
						</div>
						<p className="text-white/90 text-sm">
							Please wait while collaborators accept the invitation
						</p>
					</div>

					{/* Session Info */}
					<div className="p-6 border-b border-gray-200">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
								<div className="flex items-center text-gray-500 mb-1">
									<Code size={16} className="mr-2" />
									<span className="text-sm">Project</span>
								</div>
								<p className="text-gray-900 font-medium truncate">
									{session.problem?.title || "Loading..."}
								</p>
							</div>
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
								<div className="flex items-center text-gray-500 mb-1">
									<Clock size={16} className="mr-2" />
									<span className="text-sm">Time Limit</span>
								</div>
								<p className="text-gray-900 font-medium">
									{session.time_limit} minutes
								</p>
							</div>
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
								<div className="flex items-center text-gray-500 mb-1">
									<Code size={16} className="mr-2" />
									<span className="text-sm">Language</span>
								</div>
								<p className="text-gray-900 font-medium capitalize">
									{session.language}
								</p>
							</div>
						</div>

						{/* Progress Bar */}
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm text-gray-600">
									Collaborator Status
								</span>
								<span className="text-sm text-gray-600">
									{joinedCount} / {session.max_players} ready
								</span>
							</div>
							<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
									style={{
										width: `${(joinedCount / session.max_players) * 100}%`,
									}}
								></div>
							</div>
						</div>
					</div>

					{/* Participants List */}
					<div className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Collaborators ({participants.length} / {session.max_players})
						</h3>
						<div className="space-y-3">
							{participants.map((participant) => {
								const isCurrentUser = participant.user_id === currentUserId;
								const user = participant.user;

								return (
									<div
										key={participant.id}
										className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
											isCurrentUser
												? "bg-purple-50 border-purple-400"
												: "bg-white border-gray-200"
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
													<div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium bg-gradient-to-br from-purple-500 to-purple-600">
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
													<p className="text-gray-900 font-medium truncate">
														{user?.username || "Unknown"}
														{isCurrentUser && (
															<span className="text-purple-600 ml-2">
																(You)
															</span>
														)}
														{participant.user_id === session.host_id && (
															<span className="ml-2 text-xs text-white px-2 py-0.5 rounded-full bg-purple-500">
																Host
															</span>
														)}
													</p>
												</div>
												<div className="flex items-center space-x-3 text-sm text-gray-500">
													<span>⭐ {user?.rating || 1500}</span>
													<span>🏆 {user?.problems_solved || 0}</span>
												</div>
											</div>
										</div>

										{/* Status */}
										<div className="text-right ml-4">
											{getStatusText(participant.status)}
										</div>
									</div>
								);
							})}

							{/* Empty Slots */}
							{Array.from({
								length: session.max_players - participants.length,
							}).map((_, index) => (
								<div
									key={`empty-${index}`}
									className="flex items-center justify-between p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50"
								>
									<div className="flex items-center space-x-3">
										<div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
											<Users size={24} className="text-gray-400" />
										</div>
										<div>
											<p className="text-gray-500 font-medium">
												Waiting for collaborator...
											</p>
											<p className="text-sm text-gray-400">Slot available</p>
										</div>
									</div>
									<span className="text-gray-400">Empty</span>
								</div>
							))}
						</div>
					</div>

					{/* Footer */}
					<div className="p-6 bg-gray-50 border-t border-gray-200">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="text-center sm:text-left">
								<p className="text-gray-500 text-sm">Time elapsed</p>
								<p className="text-gray-900 font-mono text-lg">
									{formatTime(timeElapsed)}
								</p>
							</div>

							{/* Status Messages */}
							<div className="text-center flex-1">
								{allPlayersJoined ? (
									<div className="flex items-center justify-center text-green-600">
										<CheckCircle size={20} className="mr-2" />
										<span className="font-medium">
											All collaborators ready!
										</span>
									</div>
								) : invitedCount > 0 ? (
									<div className="flex items-center justify-center text-yellow-600">
										<Loader2 size={20} className="mr-2 animate-spin" />
										<span>
											Waiting for {invitedCount}{" "}
											{invitedCount === 1 ? "person" : "people"}...
										</span>
									</div>
								) : (
									<div className="text-gray-500">
										<span>Waiting for more collaborators to join...</span>
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								{isHost && (
									<button
										onClick={onStartSession}
										disabled={!canStart}
										className={`px-6 py-2 rounded-lg font-medium transition-all ${
											canStart
												? "bg-purple-500 hover:bg-purple-600 text-white"
												: "bg-gray-200 text-gray-400 cursor-not-allowed"
										}`}
									>
										{allPlayersJoined ? "Start Session" : "Start Anyway"}
									</button>
								)}
								{!isHost && (
									<div className="text-gray-500 text-sm italic">
										Waiting for host to start...
									</div>
								)}
							</div>
						</div>

						{/* Additional Info */}
						{isHost && !allPlayersJoined && joinedCount >= 2 && (
							<div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
								<p className="text-sm text-center text-purple-700">
									💡 You can start the session now with {joinedCount}{" "}
									collaborators, or wait for more to join
								</p>
							</div>
						)}

						{declinedCount > 0 && (
							<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-700 text-sm text-center">
									{declinedCount} {declinedCount === 1 ? "person" : "people"}{" "}
									declined the invitation
								</p>
							</div>
						)}

						{/* Session Type Badge */}
						<div className="mt-4 text-center">
							<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
								🤝 Collaboration Mode • Closed Session
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WaitingLobby;
