import { useState, useEffect, useCallback } from "react";
import { sessionService } from "../services/sessionService";
import type { Session, SessionParticipant } from "../types/database";
import { supabase } from "../lib/supabase";

export const useSession = (sessionId: string | null) => {
	const [session, setSession] = useState<Session | null>(null);
	const [participants, setParticipants] = useState<SessionParticipant[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Memoized load functions
	const loadSession = useCallback(async () => {
		if (!sessionId) return;

		try {
			const data = await sessionService.getSessionById(sessionId);
			console.log("Session loaded:", data);
			setSession(data);
			setError(null);
		} catch (err: any) {
			console.error("Error loading session:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [sessionId]);

	const loadParticipants = useCallback(async () => {
		if (!sessionId) return;

		try {
			const data = await sessionService.getSessionParticipants(sessionId);
			console.log("Participants loaded:", data);
			setParticipants(data);
		} catch (err: any) {
			console.error("Error loading participants:", err);
		}
	}, [sessionId]);

	useEffect(() => {
		if (!sessionId) {
			setLoading(false);
			return;
		}

		// Initial load
		loadSession();
		loadParticipants();

		// Subscribe to real-time updates for participants
		console.log("Setting up subscriptions for session:", sessionId);

		const participantsChannel = supabase
			.channel(`session-participants-${sessionId}-${Date.now()}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "session_participants",
					filter: `session_id=eq.${sessionId}`,
				},
				async (payload) => {
					console.log("🔔 Participant real-time update:", payload);
					// Reload participants data immediately
					await loadParticipants();
				}
			)
			.subscribe((status) => {
				console.log("📡 Participants subscription status:", status);
			});

		// Subscribe to real-time updates for session
		const sessionChannel = supabase
			.channel(`session-status-${sessionId}-${Date.now()}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "sessions",
					filter: `id=eq.${sessionId}`,
				},
				async (payload) => {
					console.log("🔔 Session real-time update:", payload);
					// Reload session data immediately
					await loadSession();
				}
			)
			.subscribe((status) => {
				console.log("📡 Session subscription status:", status);
			});

		return () => {
			console.log("Cleaning up subscriptions for session:", sessionId);
			supabase.removeChannel(participantsChannel);
			supabase.removeChannel(sessionChannel);
		};
	}, [sessionId, loadSession, loadParticipants]);

	const updateStatus = async (status: Session["status"]) => {
		if (!sessionId) return;

		try {
			console.log("Updating session status to:", status);
			await sessionService.updateSessionStatus(sessionId, status);
			// The real-time subscription will handle reloading
		} catch (err: any) {
			setError(err.message);
		}
	};

	const submitCode = async (code: string, testResults: any) => {
		if (!sessionId) return;

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			await sessionService.submitCode(sessionId, user.id, code, testResults);
			// The real-time subscription will handle reloading
		} catch (err: any) {
			setError(err.message);
		}
	};

	return {
		session,
		participants,
		loading,
		error,
		updateStatus,
		submitCode,
		reload: loadSession,
	};
};
