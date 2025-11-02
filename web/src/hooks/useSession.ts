import { useState, useEffect } from "react";
import { sessionService } from "../services/sessionService";
import type { Session, SessionParticipant } from "../types/database";
import { supabase } from "../lib/supabase";

export const useSession = (sessionId: string | null) => {
	const [session, setSession] = useState<Session | null>(null);
	const [participants, setParticipants] = useState<SessionParticipant[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!sessionId) {
			setLoading(false);
			return;
		}

		loadSession();
		loadParticipants();

		// Subscribe to real-time updates
		const subscription = sessionService.subscribeToSession(
			sessionId,
			handleRealtimeUpdate
		);

		return () => {
			subscription.unsubscribe();
		};
	}, [sessionId]);

	const loadSession = async () => {
		if (!sessionId) return;

		try {
			setLoading(true);
			const data = await sessionService.getSessionById(sessionId);
			setSession(data);
			setError(null);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const loadParticipants = async () => {
		if (!sessionId) return;

		try {
			const data = await sessionService.getSessionParticipants(sessionId);
			setParticipants(data);
		} catch (err: any) {
			console.error("Error loading participants:", err);
		}
	};

	const handleRealtimeUpdate = (payload: any) => {
		console.log("Real-time update:", payload);
		// Reload participants when there's an update
		loadParticipants();
	};

	const updateStatus = async (status: Session["status"]) => {
		if (!sessionId) return;

		try {
			await sessionService.updateSessionStatus(sessionId, status);
			await loadSession();
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
			await loadParticipants();
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
