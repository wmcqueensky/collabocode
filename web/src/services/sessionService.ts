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

		const { data, error } = await supabase
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

		if (error) throw error;

		// Add host as a participant
		await this.addParticipant(data.id, user.id);

		return data;
	},

	// Get session by ID
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

	// Add participant to session
	async addParticipant(sessionId: string, userId: string): Promise<void> {
		const { error } = await supabase.from("session_participants").insert({
			session_id: sessionId,
			user_id: userId,
			status: "joined",
		});

		if (error) throw error;
	},

	// Invite players to session
	async invitePlayers(sessionId: string, userIds: string[]): Promise<void> {
		const participants = userIds.map((userId) => ({
			session_id: sessionId,
			user_id: userId,
			status: "invited" as const,
		}));

		const { error } = await supabase
			.from("session_participants")
			.insert(participants);

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
			.eq("session_id", sessionId);

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
			.subscribe();
	},
};
