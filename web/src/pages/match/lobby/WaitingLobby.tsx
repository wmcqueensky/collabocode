import { useState, useEffect } from "react";
import {
	Users,
	Clock,
	Code,
	CheckCircle,
	XCircle,
	Loader2,
} from "lucide-react";
import type {
	Session,
	SessionParticipant,
	Profile,
} from "../../../../types/database";

interface WaitingLobbyProps {
	session: Session;
	participants: SessionParticipant[];
	currentUserId: string;
	onStartSession?: () => void;
}

export const WaitingLobby = ({
	session,
	participants,
	currentUserId,
	onStartSession,
}: WaitingLobbyProps) => {
	const [timeElapsed, setTimeElapsed] = useState(0);

	// Timer for elapsed time
	useEffect(() => {
		const interval = setInterval(() => {
			setTimeElapsed((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Format elapsed time
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	// Count participants by status
	const joinedCount = participants.filter((p) => p.status === "joined").length;
	const invitedCount = participants.filter(
		(p) => p.status === "invited"
	).length;
	const declinedCount = participants.filter(
		(p) => p.status === "declined"
	).length;

	const isHost = session.host_id === currentUserId;
	const allPlayersJoined = joinedCount === session.max_players;
	const canStart = isHost && joinedCount >= 2; // At least 2 players including host

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
		<div className="min-h-screen bg-[#171717] flex items-center justify-center p-4">
			<div className="max-w-4xl w-full">
				{/* Main Card */}
				<div className="bg-[#1f1f1f] rounded-xl border border-gray-700 overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-[#5bc6ca] to-[#48aeb3] p-6 text-center">
						<div className="flex items-center justify-center mb-2">
							<Users size={32} className="text-white mr-2" />
							<h1 className="text-3xl font-bold text-white">
								Waiting for Players
							</h1>
						</div>
						<p className="text-white/90 text-sm">
							Please wait while other players accept the invitation
						</p>
					</div>

					{/* Session Info */}
					<div className="p-6 border-b border-gray-700">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
							<div className="bg-[#2a2a2a] rounded-lg p-4">
								<div className="flex items-center text-gray-400 mb-1">
									<Code size={16} className="mr-2" />
									<span className="text-sm">Problem</span>
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
								<p className="text-white font-medium">
									{session.time_limit} minutes
								</p>
							</div>
							<div className="bg-[#2a2a2a] rounded-lg p-4">
								<div className="flex items-center text-gray-400 mb-1">
									<Code size={16} className="mr-2" />
									<span className="text-sm">Language</span>
								</div>
								<p className="text-white font-medium capitalize">
									{session.language}
								</p>
							</div>
						</div>

						{/* Progress Bar */}
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm text-gray-400">Player Status</span>
								<span className="text-sm text-gray-400">
									{joinedCount} / {session.max_players} ready
								</span>
							</div>
							<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-[#5bc6ca] to-[#48aeb3] transition-all duration-500"
									style={{
										width: `${(joinedCount / session.max_players) * 100}%`,
									}}
								></div>
							</div>
						</div>
					</div>

					{/* Participants List */}
					<div className="p-6">
						<h3 className="text-lg font-semibold text-white mb-4">
							Players ({participants.length} / {session.max_players})
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
												? "bg-[#5bc6ca10] border-[#5bc6ca]"
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
													<div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5bc6ca] to-[#48aeb3] flex items-center justify-center text-white font-medium">
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
															<span className="text-[#5bc6ca] ml-2">(You)</span>
														)}
														{participant.user_id === session.host_id && (
															<span className="ml-2 text-xs bg-[#5bc6ca] text-black px-2 py-0.5 rounded-full">
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
									className="flex items-center justify-between p-4 rounded-lg border border-dashed border-gray-700 bg-[#2a2a2a]/50"
								>
									<div className="flex items-center space-x-3">
										<div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
											<Users size={24} className="text-gray-500" />
										</div>
										<div>
											<p className="text-gray-500 font-medium">
												Waiting for player...
											</p>
											<p className="text-sm text-gray-600">Slot available</p>
										</div>
									</div>
									<span className="text-gray-600">Empty</span>
								</div>
							))}
						</div>
					</div>

					{/* Footer */}
					<div className="p-6 bg-[#2a2a2a] border-t border-gray-700">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="text-center sm:text-left">
								<p className="text-gray-400 text-sm">Time elapsed</p>
								<p className="text-white font-mono text-lg">
									{formatTime(timeElapsed)}
								</p>
							</div>

							{/* Status Messages */}
							<div className="text-center flex-1">
								{allPlayersJoined ? (
									<div className="flex items-center justify-center text-green-500">
										<CheckCircle size={20} className="mr-2" />
										<span className="font-medium">All players ready!</span>
									</div>
								) : invitedCount > 0 ? (
									<div className="flex items-center justify-center text-yellow-500">
										<Loader2 size={20} className="mr-2 animate-spin" />
										<span>Waiting for {invitedCount} player(s)...</span>
									</div>
								) : (
									<div className="text-gray-400">
										<span>Waiting for more players to join...</span>
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
												? "bg-[#5bc6ca] hover:bg-[#48aeb3] text-white"
												: "bg-gray-700 text-gray-500 cursor-not-allowed"
										}`}
									>
										{allPlayersJoined ? "Start Session" : "Start Anyway"}
									</button>
								)}
								{!isHost && (
									<div className="text-gray-400 text-sm italic">
										Waiting for host to start...
									</div>
								)}
							</div>
						</div>

						{/* Additional Info */}
						{isHost && !allPlayersJoined && joinedCount >= 2 && (
							<div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
								<p className="text-yellow-500 text-sm text-center">
									💡 You can start the session now with {joinedCount} players,
									or wait for more players to join
								</p>
							</div>
						)}

						{declinedCount > 0 && (
							<div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
								<p className="text-red-400 text-sm text-center">
									{declinedCount} player(s) declined the invitation
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
