import { supabase } from "../lib/supabase";

export interface SessionActivity {
	id: string;
	session_id: string;
	user_id: string;
	username: string;
	type: "passed" | "failed" | "ran" | "modifying" | "submitted";
	message: string;
	created_at: string;
}

export const sessionActivityService = {
	/**
	 * Add an activity to the session
	 */
	async addActivity(
		sessionId: string,
		userId: string,
		username: string,
		type: SessionActivity["type"],
		message: string
	): Promise<void> {
		const { error } = await supabase.from("session_activities").insert({
			session_id: sessionId,
			user_id: userId,
			username: username,
			type: type,
			message: message,
		});

		if (error) {
			console.error("Error adding activity:", error);
			throw error;
		}
	},

	/**
	 * Get activities for a session
	 */
	async getActivities(
		sessionId: string,
		limit: number = 20
	): Promise<SessionActivity[]> {
		const { data, error } = await supabase
			.from("session_activities")
			.select("*")
			.eq("session_id", sessionId)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) {
			console.error("Error fetching activities:", error);
			throw error;
		}

		return data || [];
	},

	/**
	 * Subscribe to new activities for a session
	 */
	subscribeToActivities(
		sessionId: string,
		onNewActivity: (activity: SessionActivity) => void
	) {
		return supabase
			.channel(`session-activities:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "session_activities",
					filter: `session_id=eq.${sessionId}`,
				},
				(payload) => {
					console.log("New activity received:", payload);
					onNewActivity(payload.new as SessionActivity);
				}
			)
			.subscribe((status) => {
				console.log("Activity subscription status:", status);
			});
	},

	/**
	 * Unsubscribe from activities
	 */
	unsubscribeFromActivities(sessionId: string) {
		return supabase.channel(`session-activities:${sessionId}`).unsubscribe();
	},
};
