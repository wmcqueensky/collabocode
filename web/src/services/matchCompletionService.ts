import { supabase } from "../lib/supabase";
import { matchService } from "./matchService";
import { sessionService } from "./sessionService";

export const matchCompletionService = {
	// Global listener - doesn't require being on match page
	globalCompletionListener: null as any,

	// Track which sessions are currently being processed to prevent race conditions
	processingSessionsSet: new Set<string>(),

	// Check if all participants have submitted and finalize match
	async checkAndFinalizeMatch(sessionId: string): Promise<boolean> {
		try {
			// Prevent duplicate processing with atomic check
			if (this.processingSessionsSet.has(sessionId)) {
				console.log("Session already being processed:", sessionId);
				return false;
			}

			// First check session status to avoid duplicate processing
			const session = await sessionService.getSessionById(sessionId);

			console.log("📊 Session status check:", {
				sessionId,
				status: session?.status,
				found: !!session,
			});

			if (!session) {
				console.log("❌ Session not found:", sessionId);
				return false;
			}

			if (session.status === "completed") {
				console.log("✅ Session already completed:", sessionId);
				return false;
			}

			// Check if all participants have submitted
			const allSubmitted = await matchService.checkAllSubmitted(sessionId);

			if (!allSubmitted) {
				console.log("⏳ Not all participants have submitted yet");
				return false;
			}

			// Mark as processing
			this.processingSessionsSet.add(sessionId);
			console.log("🔒 Acquired processing lock for session:", sessionId);

			console.log(
				"✅ All participants submitted, finalizing match:",
				sessionId
			);

			// IMPORTANT: Refresh participants data before calculating rankings
			// This ensures we have the latest is_correct values
			console.log("🔄 Refreshing participant data before ranking...");
			const freshParticipants = await sessionService.getSessionParticipants(
				sessionId
			);
			console.log(
				"📊 Fresh participants data:",
				freshParticipants.map((p) => ({
					user_id: p.user_id,
					is_correct: p.is_correct,
					submission_time: p.submission_time,
					ranking: p.ranking,
				}))
			);

			// Calculate rankings with fresh data
			console.log("📊 Calculating rankings...");
			await matchService.calculateRankings(sessionId);
			console.log("✅ Rankings calculated");

			// Verify rankings were set
			const rankedParticipants = await sessionService.getSessionParticipants(
				sessionId
			);
			console.log(
				"📊 After ranking:",
				rankedParticipants.map((p) => ({
					user_id: p.user_id,
					is_correct: p.is_correct,
					ranking: p.ranking,
				}))
			);

			// Update session status with atomic operation
			console.log("🔄 Attempting to update session status to completed...");

			const { data: updateData, error: statusError } = await supabase
				.from("sessions")
				.update({
					status: "completed",
					ended_at: new Date().toISOString(),
				})
				.eq("id", sessionId)
				.eq("status", "in_progress") // Only update if still in progress
				.select();

			console.log("📊 Update result:", {
				data: updateData,
				error: statusError,
				dataLength: updateData?.length,
			});

			if (statusError) {
				console.error("❌ Error updating session status:", statusError);
				this.processingSessionsSet.delete(sessionId);
				return false;
			}

			// Check if the update actually affected any rows
			if (!updateData || updateData.length === 0) {
				console.error("❌ Session status update affected 0 rows");
				console.log("This means either:");
				console.log("1. Session doesn't exist");
				console.log("2. Status was already 'completed'");
				console.log("3. Status is not 'in_progress'");

				// Let's verify the current status
				const currentSession = await sessionService.getSessionById(sessionId);
				console.log("Current session status:", currentSession?.status);

				this.processingSessionsSet.delete(sessionId);
				return false;
			}

			console.log("✅ Session status updated to completed successfully");

			// Verify the update succeeded
			const updatedSession = await sessionService.getSessionById(sessionId);
			console.log(
				"📊 Verification - Updated session status:",
				updatedSession?.status
			);

			if (!updatedSession || updatedSession.status !== "completed") {
				console.error("❌ Session status verification failed");
				console.log("Expected: completed, Got:", updatedSession?.status);
				this.processingSessionsSet.delete(sessionId);
				return false;
			}

			console.log("✅ Session status verified as completed");

			// Record match history and update ratings
			console.log("📝 Recording match history...");
			await matchService.recordMatchHistory(sessionId);
			console.log("✅ Match history recorded");

			// Create summary notifications for all participants
			console.log("📧 Creating notifications...");
			await this.createSummaryNotifications(sessionId);
			console.log("✅ Notifications created");

			console.log("🎉 Match finalized successfully:", sessionId);

			// Remove from processing set
			this.processingSessionsSet.delete(sessionId);
			console.log("🔓 Released processing lock for session:", sessionId);

			return true;
		} catch (error) {
			console.error("💥 Error finalizing match:", error);
			this.processingSessionsSet.delete(sessionId);
			return false;
		}
	},

	// Create notifications for match summary
	async createSummaryNotifications(sessionId: string): Promise<void> {
		try {
			console.log("📧 Starting notification creation for session:", sessionId);

			const participants = await sessionService.getSessionParticipants(
				sessionId
			);
			console.log("👥 Found participants:", participants.length);

			const session = await sessionService.getSessionById(sessionId);

			if (!session) {
				console.error("❌ Session not found for notifications");
				return;
			}

			// Filter for joined participants only
			const joinedParticipants = participants.filter(
				(p) => p.status === "joined"
			);
			console.log("✅ Joined participants:", joinedParticipants.length);

			// Insert notifications for all joined participants
			const notifications = joinedParticipants.map((p) => ({
				user_id: p.user_id,
				session_id: sessionId,
				type: "match_completed",
				created_at: new Date().toISOString(),
				read: false,
			}));

			if (notifications.length === 0) {
				console.log("⚠️ No participants to notify");
				return;
			}

			console.log("📤 Inserting notifications:", notifications);

			const { data, error } = await supabase
				.from("match_summary_notifications")
				.insert(notifications)
				.select();

			if (error) {
				console.error("❌ Error creating summary notifications:", error);
			} else {
				console.log("✅ Notifications inserted successfully:", data);
				console.log(
					`✅ Created ${notifications.length} summary notifications for session:`,
					sessionId
				);
			}
		} catch (error) {
			console.error("💥 Error in createSummaryNotifications:", error);
		}
	},

	// Setup global listener for ALL active sessions (runs in background)
	setupGlobalListener() {
		if (this.globalCompletionListener) {
			console.log("Global completion listener already running");
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
							"📊 Participant submitted, checking session:",
							participant.session_id
						);
						await this.checkAndFinalizeMatch(participant.session_id);
					}
				}
			)
			.subscribe((status) => {
				console.log("📡 Global completion listener status:", status);
			});
	},

	// Cleanup global listener
	cleanupGlobalListener() {
		if (this.globalCompletionListener) {
			supabase.removeChannel(this.globalCompletionListener);
			this.globalCompletionListener = null;
			this.processingSessionsSet.clear();
			console.log("🔌 Global completion listener stopped");
		}
	},

	// Subscribe to session changes and auto-finalize when ready (per-session)
	setupAutoFinalization(sessionId: string): () => void {
		const channel = supabase
			.channel(`match-completion:${sessionId}`)
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

					// Only process if submission_time was just set
					if (participant.submission_time && !oldParticipant.submission_time) {
						console.log("📊 Participant updated, checking if match complete");
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
};

// Initialize global listener when module loads
if (typeof window !== "undefined") {
	matchCompletionService.setupGlobalListener();
}
