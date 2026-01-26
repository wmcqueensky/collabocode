import type { Session, SessionParticipant } from "../../../types/database";

// Hooks
import { useWaitingLobby } from "./hooks/useWaitingLobby";

// Components
import { LobbyHeader } from "./components/LobbyHeader";
import { SessionInfoCard } from "./components/SessionInfoCard";
import { ParticipantProgressBar } from "./components/ParticipantProgressBar";
import { ParticipantCard } from "./components/ParticipantCard";
import { EmptySlot } from "./components/EmptySlot";
import { LobbyFooter } from "./components/LobbyFooter";

interface WaitingLobbyProps {
	session: Session;
	participants: SessionParticipant[];
	currentUserId: string;
	onStartSession?: () => void;
}

export const WaitingLobby = ({
	session,
	participants: initialParticipants,
	currentUserId,
	onStartSession,
}: WaitingLobbyProps) => {
	const {
		participants,
		timeElapsed,
		joinedCount,
		invitedCount,
		declinedCount,
		isHost,
		allPlayersJoined,
		canStart,
		isCollaboration,
		formatTime,
	} = useWaitingLobby({
		session,
		initialParticipants,
		currentUserId,
	});

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-4xl w-full">
				{/* Main Card */}
				<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
					{/* Header */}
					<LobbyHeader isCollaboration={isCollaboration} />

					{/* Session Info */}
					<div className="p-6 border-b border-gray-200">
						<SessionInfoCard
							session={session}
							isCollaboration={isCollaboration}
						/>
						<ParticipantProgressBar
							joinedCount={joinedCount}
							maxPlayers={session.max_players}
							isCollaboration={isCollaboration}
						/>
					</div>

					{/* Participants List */}
					<div className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							{isCollaboration ? "Collaborators" : "Players"} (
							{participants.length} / {session.max_players})
						</h3>
						<div className="space-y-3">
							{participants.map((participant) => (
								<ParticipantCard
									key={participant.id}
									participant={participant}
									isCurrentUser={participant.user_id === currentUserId}
									isHost={participant.user_id === session.host_id}
									isCollaboration={isCollaboration}
								/>
							))}

							{/* Empty Slots */}
							{Array.from({
								length: session.max_players - participants.length,
							}).map((_, index) => (
								<EmptySlot
									key={`empty-${index}`}
									isCollaboration={isCollaboration}
								/>
							))}
						</div>
					</div>

					{/* Footer */}
					<LobbyFooter
						timeElapsed={timeElapsed}
						formatTime={formatTime}
						joinedCount={joinedCount}
						invitedCount={invitedCount}
						declinedCount={declinedCount}
						isHost={isHost}
						allPlayersJoined={allPlayersJoined}
						canStart={canStart}
						isCollaboration={isCollaboration}
						onStartSession={onStartSession}
					/>
				</div>
			</div>
		</div>
	);
};
