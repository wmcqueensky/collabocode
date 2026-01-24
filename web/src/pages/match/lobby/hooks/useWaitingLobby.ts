import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import type { Session, SessionParticipant } from "../../../../types/database";

interface UseWaitingLobbyProps {
	session: Session;
	initialParticipants: SessionParticipant[];
	currentUserId: string;
}

interface UseWaitingLobbyReturn {
	// State
	participants: SessionParticipant[];
	sessionStatus: string;
	timeElapsed: number;

	// Computed values
	joinedCount: number;
	invitedCount: number;
	declinedCount: number;
	isHost: boolean;
	allPlayersJoined: boolean;
	canStart: boolean;
	isCollaboration: boolean;

	// Helpers
	formatTime: (seconds: number) => string;
}

export const useWaitingLobby = ({
	session,
	initialParticipants,
	currentUserId,
}: UseWaitingLobbyProps): UseWaitingLobbyReturn => {
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [participants, setParticipants] =
		useState<SessionParticipant[]>(initialParticipants);
	const [sessionStatus, setSessionStatus] = useState(session.status);

	// Update participants when prop changes
	useEffect(() => {
		setParticipants(initialParticipants);
	}, [initialParticipants]);

	// Real-time subscription for participant updates
	useEffect(() => {
		if (!session.id) return;

		// Subscribe to participant changes
		const participantChannel = supabase
			.channel(`waiting-lobby-participants:${session.id}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "session_participants",
					filter: `session_id=eq.${session.id}`,
				},
				async (payload) => {
					console.log("[WaitingLobby] Participant update:", payload);

					// Refetch all participants to get user data
					const { data: updatedParticipants } = await supabase
						.from("session_participants")
						.select(
							`
							*,
							user:profiles(id, username, avatar_url, rating, problems_solved)
						`,
						)
						.eq("session_id", session.id);

					if (updatedParticipants) {
						setParticipants(updatedParticipants as SessionParticipant[]);
					}
				},
			)
			.subscribe((status) => {
				console.log("[WaitingLobby] Participant subscription:", status);
			});

		// Subscribe to session status changes
		const sessionChannel = supabase
			.channel(`waiting-lobby-session:${session.id}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "sessions",
					filter: `id=eq.${session.id}`,
				},
				(payload) => {
					console.log("[WaitingLobby] Session update:", payload);
					const updatedSession = payload.new as Session;
					setSessionStatus(updatedSession.status);

					// If session started, trigger navigation
					if (updatedSession.status === "in_progress") {
						// Force page reload to enter the session
						window.location.reload();
					}
				},
			)
			.subscribe((status) => {
				console.log("[WaitingLobby] Session subscription:", status);
			});

		return () => {
			supabase.removeChannel(participantChannel);
			supabase.removeChannel(sessionChannel);
		};
	}, [session.id]);

	// Timer for elapsed time
	useEffect(() => {
		const interval = setInterval(() => {
			setTimeElapsed((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Format elapsed time
	const formatTime = useCallback((seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}, []);

	// Computed values
	const joinedCount = participants.filter((p) => p.status === "joined").length;
	const invitedCount = participants.filter(
		(p) => p.status === "invited",
	).length;
	const declinedCount = participants.filter(
		(p) => p.status === "declined",
	).length;

	const isHost = session.host_id === currentUserId;
	const allPlayersJoined = joinedCount === session.max_players;
	const canStart = isHost && joinedCount >= 2;
	const isCollaboration = session.type === "collaboration";

	return {
		// State
		participants,
		sessionStatus,
		timeElapsed,

		// Computed values
		joinedCount,
		invitedCount,
		declinedCount,
		isHost,
		allPlayersJoined,
		canStart,
		isCollaboration,

		// Helpers
		formatTime,
	};
};
