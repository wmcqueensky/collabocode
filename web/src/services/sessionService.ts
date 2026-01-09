import { supabase } from "../lib/supabase";
import type {
	Session,
	SessionParticipant,
	SessionType,
} from "../types/database";

export const sessionService = {
	// Create a new session (supports both match and collaboration)
	async createSession(sessionData: {
		type?: SessionType;
		problem_id: string;
		language: string;
		time_limit: number;
		max_players: number;
		description?: string;
		is_public?: boolean;
		allow_join_in_progress?: boolean;
	}): Promise<Session> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("Not authenticated");

		const { data: session, error: sessionError } = await supabase
			.from("sessions")
			.insert({
				type: sessionData.type || "match",
				problem_id: sessionData.problem_id,
				language: sessionData.language,
				time_limit: sessionData.time_limit,
				max_players: sessionData.max_players,
				host_id: user.id,
				description: sessionData.description || null,
				is_public: sessionData.is_public || false,
				allow_join_in_progress: sessionData.allow_join_in_progress || false,
			})
			.select(`*, problem:problems(*), host:profiles(*)`)
			.single();

		if (sessionError) throw sessionError;
		if (!session) throw new Error("Failed to create session");

		// Add host as a participant with 'host' role
		const { error: participantError } = await supabase
			.from("session_participants")
			.insert({
				session_id: session.id,
				user_id: user.id,
				status: "joined",
				role: "host",
			});

		if (participantError) {
			// Cleanup on failure
			await supabase.from("sessions").delete().eq("id", session.id);
			throw participantError;
		}

		return session;
	},

	// Create a match session (convenience method)
	async createMatchSession(sessionData: {
		problem_id: string;
		language: string;
		time_limit: number;
		max_players: number;
	}): Promise<Session> {
		return this.createSession({
			...sessionData,
			type: "match",
		});
	},

	// Create a collaboration session (convenience method)
	async createCollaborationSession(sessionData: {
		problem_id: string;
		language: string;
		time_limit: number;
		max_players: number;
		description?: string;
		is_public?: boolean;
		allow_join_in_progress?: boolean;
	}): Promise<Session> {
		return this.createSession({
			...sessionData,
			type: "collaboration",
			allow_join_in_progress: sessionData.allow_join_in_progress ?? true,
		});
	},

	// Get session by ID
	async getSessionById(id: string): Promise<Session | null> {
		const { data, error } = await supabase
			.from("sessions")
			.select(`*, problem:problems(*), host:profiles(*)`)
			.eq("id", id)
			.single();

		if (error) throw error;
		return data;
	},

	// Get sessions by type
	async getSessionsByType(type: SessionType): Promise<Session[]> {
		const { data, error } = await supabase
			.from("sessions")
			.select(`*, problem:problems(*), host:profiles(*)`)
			.eq("type", type)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data || [];
	},

	// Get public sessions available to join
	async getPublicSessions(type?: SessionType): Promise<Session[]> {
		let query = supabase
			.from("sessions")
			.select(`*, problem:problems(*), host:profiles(*)`)
			.eq("is_public", true)
			.in("status", ["waiting", "in_progress"]);

		if (type) {
			query = query.eq("type", type);
		}

		const { data, error } = await query.order("created_at", {
			ascending: false,
		});

		if (error) throw error;
		return data || [];
	},

	// Add participant to session
	async addParticipant(
		sessionId: string,
		userId: string,
		role: "participant" | "viewer" = "participant"
	): Promise<void> {
		// Check if participant already exists
		const { data: existing } = await supabase
			.from("session_participants")
			.select("id")
			.eq("session_id", sessionId)
			.eq("user_id", userId)
			.single();

		if (!existing) {
			const { error } = await supabase.from("session_participants").insert({
				session_id: sessionId,
				user_id: userId,
				status: "joined",
				role,
			});

			if (error) throw error;
		}
	},

	// Invite players to session
	async invitePlayers(sessionId: string, userIds: string[]): Promise<void> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("Not authenticated");

		// Filter out the current user
		const filteredUserIds = userIds.filter((id) => id !== user.id);

		if (filteredUserIds.length === 0) return;

		// Check for existing participants
		const { data: existingParticipants } = await supabase
			.from("session_participants")
			.select("user_id")
			.eq("session_id", sessionId)
			.in("user_id", filteredUserIds);

		const existingUserIds = new Set(
			existingParticipants?.map((p) => p.user_id) || []
		);

		const newParticipants = filteredUserIds
			.filter((userId) => !existingUserIds.has(userId))
			.map((userId) => ({
				session_id: sessionId,
				user_id: userId,
				status: "invited" as const,
				role: "participant" as const,
			}));

		if (newParticipants.length === 0) return;

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
			.select(`*, user:profiles(*)`)
			.eq("session_id", sessionId)
			.order("joined_at", { ascending: true });

		if (error) throw error;
		return data || [];
	},

	// Update session status
	async updateSessionStatus(
		sessionId: string,
		status: "waiting" | "in_progress" | "completing" | "completed" | "cancelled"
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

	// Update participant status
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

	// Update participant role
	async updateParticipantRole(
		sessionId: string,
		userId: string,
		role: "host" | "participant" | "viewer"
	): Promise<void> {
		const { error } = await supabase
			.from("session_participants")
			.update({ role })
			.eq("session_id", sessionId)
			.eq("user_id", userId);

		if (error) throw error;
	},

	// Update participant's last active timestamp (for collaboration)
	async updateParticipantActivity(
		sessionId: string,
		userId: string
	): Promise<void> {
		const { error } = await supabase
			.from("session_participants")
			.update({ last_active_at: new Date().toISOString() })
			.eq("session_id", sessionId)
			.eq("user_id", userId);

		if (error) throw error;
	},

	// Update participant's cursor position (for collaboration)
	async updateCursorPosition(
		sessionId: string,
		userId: string,
		cursorPosition: { line: number; column: number }
	): Promise<void> {
		const { error } = await supabase
			.from("session_participants")
			.update({
				cursor_position: cursorPosition,
				last_active_at: new Date().toISOString(),
			})
			.eq("session_id", sessionId)
			.eq("user_id", userId);

		if (error) throw error;
	},

	// NEW: Update test progress WITHOUT setting submission_time
	// Use this when running tests (not submitting)
	async updateTestProgress(
		sessionId: string,
		userId: string,
		code: string,
		testResults: any
	): Promise<void> {
		const { error } = await supabase
			.from("session_participants")
			.update({
				code_snapshot: code,
				test_results: testResults,
				// Note: NOT setting submission_time or is_correct here
				// This is just progress tracking, not a final submission
			})
			.eq("session_id", sessionId)
			.eq("user_id", userId);

		if (error) throw error;
	},

	// Submit code for a participant (FINAL submission only)
	// This sets submission_time which triggers finalization checks
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

	// Get all sessions for a user
	async getUserSessions(
		userId?: string,
		type?: SessionType
	): Promise<Session[]> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const targetUserId = userId || user?.id;

		if (!targetUserId) return [];

		// Get sessions where user is host
		let hostQuery = supabase
			.from("sessions")
			.select(`*, problem:problems(*), host:profiles(*)`)
			.eq("host_id", targetUserId);

		if (type) {
			hostQuery = hostQuery.eq("type", type);
		}

		const { data: hostedSessions } = await hostQuery.order("created_at", {
			ascending: false,
		});

		// Get sessions where user is participant
		const { data: participantSessions } = await supabase
			.from("session_participants")
			.select(`session:sessions(*, problem:problems(*), host:profiles(*))`)
			.eq("user_id", targetUserId);

		let allSessions = [
			...(hostedSessions || []),
			...(participantSessions?.map((p: any) => p.session).filter(Boolean) ||
				[]),
		];

		// Filter by type if specified
		if (type) {
			allSessions = allSessions.filter((s) => s.type === type);
		}

		// Remove duplicates
		const uniqueSessions = allSessions.filter(
			(session, index, self) =>
				index === self.findIndex((s) => s.id === session.id)
		);

		return uniqueSessions;
	},

	// Get user's match sessions
	async getUserMatchSessions(userId?: string): Promise<Session[]> {
		return this.getUserSessions(userId, "match");
	},

	// Get user's collaboration sessions
	async getUserCollaborationSessions(userId?: string): Promise<Session[]> {
		return this.getUserSessions(userId, "collaboration");
	},
};
