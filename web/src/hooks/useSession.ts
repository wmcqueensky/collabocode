import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { sessionService } from "../services/sessionService";
import type { Session, SessionParticipant } from "../types/database";

interface UseSessionReturn {
	session: Session | null;
	participants: SessionParticipant[];
	loading: boolean;
	error: string | null;
	// NEW: Separate function for updating test progress (no submission)
	updateTestProgress: (code: string, testResults: any) => Promise<void>;
	// Submit code (final submission with submission_time)
	submitCode: (code: string, testResults: any) => Promise<void>;
	updateStatus: (
		status: "waiting" | "in_progress" | "completing" | "completed" | "cancelled"
	) => Promise<void>;
	refetch: () => Promise<void>;
}

export function useSession(sessionId: string | null): UseSessionReturn {
	const [session, setSession] = useState<Session | null>(null);
	const [participants, setParticipants] = useState<SessionParticipant[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	// Get current user
	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setCurrentUserId(user.id);
			}
		};
		getUser();
	}, []);

	// Fetch session data
	const fetchSession = useCallback(async () => {
		if (!sessionId) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// Get session
			const sessionData = await sessionService.getSessionById(sessionId);
			if (!sessionData) {
				setError("Session not found");
				return;
			}
			setSession(sessionData);

			// Get participants
			const participantsData = await sessionService.getSessionParticipants(
				sessionId
			);
			setParticipants(participantsData);
		} catch (err: any) {
			console.error("Error fetching session:", err);
			setError(err.message || "Failed to load session");
		} finally {
			setLoading(false);
		}
	}, [sessionId]);

	// Initial fetch
	useEffect(() => {
		fetchSession();
	}, [fetchSession]);

	// Real-time subscription
	useEffect(() => {
		if (!sessionId) return;

		const channel = supabase
			.channel(`session-hook:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "session_participants",
					filter: `session_id=eq.${sessionId}`,
				},
				async () => {
					// Refetch participants on any change
					const participantsData = await sessionService.getSessionParticipants(
						sessionId
					);
					setParticipants(participantsData);
				}
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "sessions",
					filter: `id=eq.${sessionId}`,
				},
				async () => {
					// Refetch session on update
					const sessionData = await sessionService.getSessionById(sessionId);
					if (sessionData) {
						setSession(sessionData);
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionId]);

	// NEW: Update test progress WITHOUT triggering submission
	// Use this when running tests from the Test Cases panel or Run button
	const updateTestProgress = useCallback(
		async (code: string, testResults: any) => {
			if (!sessionId || !currentUserId) {
				throw new Error("Session or user not available");
			}

			await sessionService.updateTestProgress(
				sessionId,
				currentUserId,
				code,
				testResults
			);
		},
		[sessionId, currentUserId]
	);

	// Submit code (final submission)
	// Use this ONLY when the user clicks the Submit button
	const submitCode = useCallback(
		async (code: string, testResults: any) => {
			if (!sessionId || !currentUserId) {
				throw new Error("Session or user not available");
			}

			await sessionService.submitCode(
				sessionId,
				currentUserId,
				code,
				testResults
			);
		},
		[sessionId, currentUserId]
	);

	// Update session status
	const updateStatus = useCallback(
		async (
			status:
				| "waiting"
				| "in_progress"
				| "completing"
				| "completed"
				| "cancelled"
		) => {
			if (!sessionId) {
				throw new Error("Session not available");
			}

			await sessionService.updateSessionStatus(sessionId, status);
		},
		[sessionId]
	);

	return {
		session,
		participants,
		loading,
		error,
		updateTestProgress,
		submitCode,
		updateStatus,
		refetch: fetchSession,
	};
}
