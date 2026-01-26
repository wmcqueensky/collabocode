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
								All {isCollaboration ? "collaborators" : "players"} ready!
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
										: "bg-sky-500 hover:bg-sky-600 text-white"
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
				<div
					className={`mt-4 p-3 rounded-lg ${
						isCollaboration
							? "bg-purple-50 border border-purple-200"
							: "bg-yellow-50 border border-yellow-200"
					}`}
				>
					<p
						className={`text-sm text-center ${
							isCollaboration ? "text-purple-700" : "text-yellow-700"
						}`}
					>
						💡 You can start the session now with {joinedCount}{" "}
						{isCollaboration ? "collaborators" : "players"}, or wait for more to
						join
					</p>
				</div>
			)}

			{declinedCount > 0 && (
				<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-700 text-sm text-center">
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
							? "bg-purple-100 text-purple-700"
							: "bg-sky-100 text-sky-700"
					}`}
				>
					{isCollaboration ? "🤝 Collaboration Mode" : "⚔️ Match Mode"} • Closed
					Session
				</span>
			</div>
		</div>
	);
};
