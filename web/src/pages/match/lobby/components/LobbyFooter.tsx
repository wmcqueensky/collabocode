import { CheckCircle, Loader2 } from "lucide-react";

interface LobbyFooterProps {
	timeElapsed: number;
	formatTime: (seconds: number) => string;
	joinedCount: number;
	invitedCount: number;
	declinedCount: number;
	isHost: boolean;
	allPlayersJoined: boolean;
	canStart: boolean;
	isCollaboration: boolean;
	onStartSession?: () => void;
}

export const LobbyFooter = ({
	timeElapsed,
	formatTime,
	joinedCount,
	invitedCount,
	declinedCount,
	isHost,
	allPlayersJoined,
	canStart,
	isCollaboration,
	onStartSession,
}: LobbyFooterProps) => {
	return (
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
							<span className="font-medium">
								All {isCollaboration ? "collaborators" : "players"} ready!
							</span>
						</div>
					) : invitedCount > 0 ? (
						<div className="flex items-center justify-center text-yellow-500">
							<Loader2 size={20} className="mr-2 animate-spin" />
							<span>
								Waiting for {invitedCount}{" "}
								{invitedCount === 1 ? "person" : "people"}...
							</span>
						</div>
					) : (
						<div className="text-gray-400">
							<span>
								Waiting for more {isCollaboration ? "collaborators" : "players"}{" "}
								to join...
							</span>
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
									? isCollaboration
										? "bg-purple-500 hover:bg-purple-600 text-white"
										: "bg-[#5bc6ca] hover:bg-[#48aeb3] text-white"
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
				<div
					className={`mt-4 p-3 rounded-lg ${
						isCollaboration
							? "bg-purple-500/10 border border-purple-500/30"
							: "bg-yellow-500/10 border border-yellow-500/30"
					}`}
				>
					<p
						className={`text-sm text-center ${
							isCollaboration ? "text-purple-400" : "text-yellow-500"
						}`}
					>
						💡 You can start the session now with {joinedCount}{" "}
						{isCollaboration ? "collaborators" : "players"}, or wait for more to
						join
					</p>
				</div>
			)}

			{declinedCount > 0 && (
				<div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
					<p className="text-red-400 text-sm text-center">
						{declinedCount} {declinedCount === 1 ? "person" : "people"} declined
						the invitation
					</p>
				</div>
			)}

			{/* Session Type Badge */}
			<div className="mt-4 text-center">
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
						isCollaboration
							? "bg-purple-500/20 text-purple-400"
							: "bg-[#5bc6ca]/20 text-[#5bc6ca]"
					}`}
				>
					{isCollaboration ? "🤝 Collaboration Mode" : "⚔️ Match Mode"} • Closed
					Session
				</span>
			</div>
		</div>
	);
};
