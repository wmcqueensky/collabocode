import { supabase } from "../lib/supabase";
import type { Session, SessionParticipant } from "../types/database";

export const sessionService = {
	// Create a new session
	async createSession(sessionData: {
		problem_id: string;
		language: string;
		time_limit: number;
		max_players: number;
	}): Promise<Session> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("Not authenticated");

		const { data: session, error: sessionError } = await supabase
			.from("sessions")
			.insert({
				...sessionData,
				host_id: user.id,
			})
			.select(
				`
        *,
        problem:problems(*),
        host:profiles(*)
      `
			)
			.single();

		if (sessionError) throw sessionError;
		if (!session) throw new Error("Failed to create session");

		// Step 2: Add host as a participant
		const { error: participantError } = await supabase
			.from("session_participants")
			.insert({
				session_id: session.id,
				user_id: user.id,
				status: "joined",
			});

		if (participantError) {
			// If participant insert fails, delete the session to keep database clean
			await supabase.from("sessions").delete().eq("id", session.id);
			throw participantError;
		}

		return session;
	},

	async getSessionById(id: string): Promise<Session | null> {
		const { data, error } = await supabase
			.from("sessions")
			.select(
				`
        *,
        problem:problems(*),
        host:profiles(*)
      `
			)
			.eq("id", id)
			.single();

		if (error) throw error;
		return data;
	},

	// Add participant to session (used internally, not for invites)
	async addParticipant(sessionId: string, userId: string): Promise<void> {
		// Check if participant already exists
		const { data: existing } = await supabase
			.from("session_participants")
			.select("id")
			.eq("session_id", sessionId)
			.eq("user_id", userId)
			.single();

		// Only insert if participant doesn't exist
		if (!existing) {
			const { error } = await supabase.from("session_participants").insert({
				session_id: sessionId,
				user_id: userId,
				status: "joined",
			});

			if (error) throw error;
		}
	},

	// Invite players to session
	async invitePlayers(sessionId: string, userIds: string[]): Promise<void> {
		// Get current user
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("Not authenticated");

		// Filter out the current user (host) from invitations
		const filteredUserIds = userIds.filter((id) => id !== user.id);

		if (filteredUserIds.length === 0) {
			return; // Nothing to do
		}

		// Check for existing participants to avoid duplicates
		const { data: existingParticipants } = await supabase
			.from("session_participants")
			.select("user_id")
			.eq("session_id", sessionId)
			.in("user_id", filteredUserIds);

		const existingUserIds = new Set(
			existingParticipants?.map((p) => p.user_id) || []
		);

		// Only invite users who aren't already participants
		const newParticipants = filteredUserIds
			.filter((userId) => !existingUserIds.has(userId))
			.map((userId) => ({
				session_id: sessionId,
				user_id: userId,
				status: "invited" as const,
			}));

		if (newParticipants.length === 0) {
			return; // All users are already participants
		}

		const { error } = await supabase
			.from("session_participants")
			.insert(newParticipants);

		if (error) throw error;
	},

	// Get session participants
	async getSessionParticipants(
		sessionId: string
	): Promise<SessionParticipant[]> {
		const { data, error } = await supabase
			.from("session_participants")
			.select(
				`
        *,
        user:profiles(*)
      `
			)
			.eq("session_id", sessionId)
			.order("joined_at", { ascending: true });

		if (error) throw error;
		return data || [];
	},

	// Update session status
	async updateSessionStatus(
		sessionId: string,
		status: "waiting" | "in_progress" | "completed" | "cancelled"
	): Promise<void> {
		const updates: any = { status };

		if (status === "in_progress") {
			updates.started_at = new Date().toISOString();
		} else if (status === "completed" || status === "cancelled") {
			updates.ended_at = new Date().toISOString();
		}

		const { error } = await supabase
			.from("sessions")
			.update(updates)
			.eq("id", sessionId);

		if (error) throw error;
	},

	// Update participant status (accept/decline invitation)
	async updateParticipantStatus(
		sessionId: string,
		userId: string,
		status: "joined" | "declined" | "left"
	): Promise<void> {
		const { error } = await supabase
			.from("session_participants")
			.update({ status })
			.eq("session_id", sessionId)
			.eq("user_id", userId);

		if (error) throw error;
	},

	// Submit code for a participant
	async submitCode(
		sessionId: string,
		userId: string,
		code: string,
		testResults: any
	): Promise<void> {
		const { error } = await supabase
			.from("session_participants")
			.update({
				code_snapshot: code,
				submission_time: new Date().toISOString(),
				test_results: testResults,
				is_correct: testResults.allPassed || false,
			})
			.eq("session_id", sessionId)
			.eq("user_id", userId);

		if (error) throw error;
	},

	// Subscribe to session updates (real-time)
	subscribeToSession(sessionId: string, callback: (payload: any) => void) {
		return supabase
			.channel(`session:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "session_participants",
					filter: `session_id=eq.${sessionId}`,
				},
				callback
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "sessions",
					filter: `id=eq.${sessionId}`,
				},
				callback
			)
			.subscribe();
	},

	// Unsubscribe from session updates
	unsubscribeFromSession(sessionId: string) {
		return supabase.channel(`session:${sessionId}`).unsubscribe();
	},

	// Get all sessions for a user (host or participant)
	async getUserSessions(userId?: string): Promise<Session[]> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const targetUserId = userId || user?.id;

		if (!targetUserId) return [];

		// Get sessions where user is host
		const { data: hostedSessions } = await supabase
			.from("sessions")
			.select(
				`
        *,
        problem:problems(*),
        host:profiles(*)
      `
			)
			.eq("host_id", targetUserId)
			.order("created_at", { ascending: false });

		// Get sessions where user is participant
		const { data: participantSessions } = await supabase
			.from("session_participants")
			.select(
				`
        session:sessions(
          *,
          problem:problems(*),
          host:profiles(*)
        )
      `
			)
			.eq("user_id", targetUserId);

		const allSessions = [
			...(hostedSessions || []),
			...(participantSessions?.map((p: any) => p.session) || []),
		];

		// Remove duplicates based on session id
		const uniqueSessions = allSessions.filter(
			(session, index, self) =>
				index === self.findIndex((s) => s.id === session.id)
		);

		return uniqueSessions;
	},
};
