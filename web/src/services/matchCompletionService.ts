import { supabase } from "../lib/supabase";
import { matchService } from "./matchService";

/**
 * Match Completion Service
 * Handles the finalization of matches including rankings, history, and notifications
 * Uses atomic operations and proper synchronization to prevent race conditions
 */
export const matchCompletionService = {
	// Global listener reference
	globalCompletionListener: null as any,

	// Track which sessions are currently being processed
	processingSessionsMap: new Map<string, number>(),

	// Lock timeout in milliseconds (30 seconds)
	LOCK_TIMEOUT: 30000,

	/**
	 * Acquire a processing lock for a session
	 */
	acquireLock(sessionId: string): boolean {
		const now = Date.now();
		const existingLock = this.processingSessionsMap.get(sessionId);

		if (existingLock && now - existingLock < this.LOCK_TIMEOUT) {
			console.log(
				`🔒 Session ${sessionId} is already being processed (lock age: ${
					now - existingLock
				}ms)`
			);
			return false;
		}

		this.processingSessionsMap.set(sessionId, now);
		console.log(`🔒 Acquired lock for session ${sessionId}`);
		return true;
	},

	/**
	 * Release a processing lock for a session
	 */
	releaseLock(sessionId: string): void {
		this.processingSessionsMap.delete(sessionId);
		console.log(`🔓 Released lock for session ${sessionId}`);
	},

	/**
	 * Check if all participants have submitted and finalize match
	 */
	async checkAndFinalizeMatch(sessionId: string): Promise<boolean> {
		// Try to acquire lock
		if (!this.acquireLock(sessionId)) {
			return false;
		}

		try {
			console.log("🏁 Starting match finalization check for:", sessionId);

			// Step 1: Get session status directly from DB
			const { data: session, error: sessionError } = await supabase
				.from("sessions")
				.select("id, status, problem_id")
				.eq("id", sessionId)
				.single();

			if (sessionError || !session) {
				console.log("❌ Session not found:", sessionId);
				return false;
			}

			if (session.status === "completed") {
				console.log("✅ Session already completed:", sessionId);
				return false;
			}

			if (session.status !== "in_progress") {
				console.log("⏳ Session not in progress:", session.status);
				return false;
			}

			// Step 2: Check if all participants have submitted
			const allSubmitted = await matchService.checkAllSubmitted(sessionId);

			if (!allSubmitted) {
				console.log("⏳ Not all participants have submitted yet");
				return false;
			}

			console.log("✅ All participants submitted, starting finalization...");

			// Step 3: Acquire database lock by setting status to 'completing'
			const { data: lockData, error: lockError } = await supabase
				.from("sessions")
				.update({ status: "completing" })
				.eq("id", sessionId)
				.eq("status", "in_progress")
				.select();

			if (lockError || !lockData || lockData.length === 0) {
				console.log(
					"⚠️ Could not acquire database lock - session may be processed elsewhere"
				);
				return false;
			}

			console.log("🔒 Database lock acquired via 'completing' status");

			try {
				// Step 4: Calculate rankings
				console.log("📊 Calculating rankings...");
				await matchService.calculateRankings(sessionId);
				console.log("✅ Rankings calculated");

				// Step 5: Small delay to ensure DB commits
				await new Promise((resolve) => setTimeout(resolve, 200));

				// Step 6: Verify rankings are set
				const { data: rankedParticipants } = await supabase
					.from("session_participants")
					.select("id, user_id, ranking, is_correct")
					.eq("session_id", sessionId)
					.eq("status", "joined");

				console.log("📊 Verified rankings:", rankedParticipants);

				const unrankedCount =
					rankedParticipants?.filter(
						(p) => p.ranking === null || p.ranking === undefined
					).length || 0;

				if (unrankedCount > 0) {
					console.error(`❌ ${unrankedCount} participants still unranked`);
					// Retry once more
					await matchService.calculateRankings(sessionId);
					await new Promise((resolve) => setTimeout(resolve, 200));
				}

				// Step 7: Record match history
				console.log("📝 Recording match history...");
				await matchService.recordMatchHistory(sessionId);
				console.log("✅ Match history recorded");

				// Step 8: Update session status to completed
				const { error: completeError } = await supabase
					.from("sessions")
					.update({
						status: "completed",
						ended_at: new Date().toISOString(),
					})
					.eq("id", sessionId);

				if (completeError) {
					console.error(
						"❌ Error setting session to completed:",
						completeError
					);
					throw completeError;
				}

				console.log("✅ Session status set to completed");

				// Step 9: Create notifications
				console.log("📧 Creating notifications...");
				await this.createSummaryNotifications(sessionId);
				console.log("✅ Notifications created");

				console.log("🎉 Match finalized successfully:", sessionId);
				return true;
			} catch (innerError) {
				// Reset status on error
				console.error(
					"❌ Error during finalization, resetting status:",
					innerError
				);
				await supabase
					.from("sessions")
					.update({ status: "in_progress" })
					.eq("id", sessionId)
					.eq("status", "completing");
				throw innerError;
			}
		} catch (error) {
			console.error("💥 Error in checkAndFinalizeMatch:", error);
			return false;
		} finally {
			this.releaseLock(sessionId);
		}
	},

	/**
	 * Create notifications for match summary
	 */
	async createSummaryNotifications(sessionId: string): Promise<void> {
		try {
			console.log("📧 Creating notifications for session:", sessionId);

			// Get participants directly
			const { data: participants, error } = await supabase
				.from("session_participants")
				.select("user_id")
				.eq("session_id", sessionId)
				.eq("status", "joined");

			if (error) {
				console.error(
					"❌ Error fetching participants for notifications:",
					error
				);
				return;
			}

			if (!participants || participants.length === 0) {
				console.log("⚠️ No participants to notify");
				return;
			}

			// Check for existing notifications
			const { data: existingNotifs } = await supabase
				.from("match_summary_notifications")
				.select("user_id")
				.eq("session_id", sessionId);

			const existingUserIds = new Set(
				existingNotifs?.map((n) => n.user_id) || []
			);

			// Create notifications for users who don't have one
			const newNotifications = participants
				.filter((p) => !existingUserIds.has(p.user_id))
				.map((p) => ({
					user_id: p.user_id,
					session_id: sessionId,
					type: "match_completed",
					created_at: new Date().toISOString(),
					read: false,
				}));

			if (newNotifications.length === 0) {
				console.log("ℹ️ All notifications already exist");
				return;
			}

			const { error: insertError } = await supabase
				.from("match_summary_notifications")
				.insert(newNotifications);

			if (insertError) {
				console.error("❌ Error creating notifications:", insertError);
			} else {
				console.log(`✅ Created ${newNotifications.length} notifications`);
			}
		} catch (error) {
			console.error("💥 Error in createSummaryNotifications:", error);
		}
	},

	/**
	 * Setup global listener for all active sessions
	 */
	setupGlobalListener(): void {
		if (this.globalCompletionListener) {
			console.log("ℹ️ Global completion listener already running");
			return;
		}

		console.log("🌐 Starting global match completion listener");

		this.globalCompletionListener = supabase
			.channel("global-match-completion")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "session_participants",
				},
				async (payload) => {
					const participant = payload.new as any;
					const oldParticipant = payload.old as any;

					// Only process if submission_time was just set
					if (participant.submission_time && !oldParticipant.submission_time) {
						console.log(
							"📊 Detected new submission for session:",
							participant.session_id
						);

						// Add delay to let other updates settle
						await new Promise((resolve) => setTimeout(resolve, 500));

						await this.checkAndFinalizeMatch(participant.session_id);
					}
				}
			)
			.subscribe((status) => {
				console.log("📡 Global completion listener status:", status);
			});
	},

	/**
	 * Cleanup global listener
	 */
	cleanupGlobalListener(): void {
		if (this.globalCompletionListener) {
			supabase.removeChannel(this.globalCompletionListener);
			this.globalCompletionListener = null;
			this.processingSessionsMap.clear();
			console.log("🔌 Global completion listener stopped");
		}
	},

	/**
	 * Setup per-session auto-finalization listener
	 */
	setupAutoFinalization(sessionId: string): () => void {
		const channelName = `match-completion:${sessionId}:${Date.now()}`;

		const channel = supabase
			.channel(channelName)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "session_participants",
					filter: `session_id=eq.${sessionId}`,
				},
				async (payload) => {
					const participant = payload.new as any;
					const oldParticipant = payload.old as any;

					if (participant.submission_time && !oldParticipant.submission_time) {
						console.log("📊 Participant submitted, checking if match complete");

						await new Promise((resolve) => setTimeout(resolve, 300));

						await this.checkAndFinalizeMatch(sessionId);
					}
				}
			)
			.subscribe((status) => {
				console.log(`📡 Match completion subscription (${sessionId}):`, status);
			});

		return () => {
			supabase.removeChannel(channel);
		};
	},

	/**
	 * Manual finalization trigger (for debugging)
	 */
	async forceFinalize(sessionId: string): Promise<boolean> {
		console.log("⚠️ Force finalizing match:", sessionId);

		try {
			await matchService.calculateRankings(sessionId);
			await matchService.recordMatchHistory(sessionId);

			await supabase
				.from("sessions")
				.update({
					status: "completed",
					ended_at: new Date().toISOString(),
				})
				.eq("id", sessionId);

			await this.createSummaryNotifications(sessionId);

			console.log("✅ Force finalization complete");
			return true;
		} catch (error) {
			console.error("❌ Force finalization failed:", error);
			return false;
		}
	},
};

// Initialize global listener (client-side only)
if (typeof window !== "undefined") {
	matchCompletionService.setupGlobalListener();
}
