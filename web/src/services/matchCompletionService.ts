import { supabase } from "../lib/supabase";
import { matchService } from "./matchService";
import type { SessionType } from "../types/database";

/**
 * Session Completion Service
 * Handles the finalization of both match and collaboration sessions
 * including rankings, history, ratings, and notifications
 */
export const matchCompletionService = {
	// Global listener reference
	globalCompletionListener: null as any,

	// Track which sessions are currently being processed
	processingSessionsMap: new Map<string, number>(),

	// Lock timeout in milliseconds (30 seconds)
	LOCK_TIMEOUT: 30000,

	// ELO K-factor for rating calculations
	ELO_K_FACTOR: 32,

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
	 * Check if all participants have fully submitted (for collaboration, check final_submission flag)
	 */
	async checkAllSubmittedForSession(
		sessionId: string,
		sessionType: SessionType
	): Promise<boolean> {
		const { data: participants, error } = await supabase
			.from("session_participants")
			.select("user_id, submission_time, test_results, status")
			.eq("session_id", sessionId)
			.eq("status", "joined");

		if (error || !participants) {
			console.error("Error checking submissions:", error);
			return false;
		}

		if (participants.length === 0) {
			return false;
		}

		// For collaboration sessions, check for final_submission flag
		if (sessionType === "collaboration") {
			const allFinalSubmitted = participants.every((p) => {
				const testResults = p.test_results as any;
				return testResults?.final_submission === true;
			});

			console.log(
				`📊 Collaboration submission check: ${
					participants.filter((p) => (p.test_results as any)?.final_submission)
						.length
				}/${participants.length} final submissions`
			);
			return allFinalSubmitted;
		}

		// For match sessions, check submission_time (original behavior)
		const allSubmitted = participants.every((p) => p.submission_time !== null);
		console.log(
			`📊 Match submission check: ${
				participants.filter((p) => p.submission_time).length
			}/${participants.length} submissions`
		);
		return allSubmitted;
	},

	/**
	 * Check if all participants have submitted and finalize session
	 */
	async checkAndFinalizeSession(sessionId: string): Promise<boolean> {
		// Try to acquire lock
		if (!this.acquireLock(sessionId)) {
			return false;
		}

		try {
			console.log("🏁 Starting session finalization check for:", sessionId);

			// Step 1: Get session status directly from DB
			const { data: session, error: sessionError } = await supabase
				.from("sessions")
				.select("id, status, problem_id, type, max_players, time_limit")
				.eq("id", sessionId)
				.single();

			if (sessionError || !session) {
				console.log("❌ Session not found:", sessionId);
				return false;
			}

			const sessionType: SessionType = session.type || "match";
			console.log(`📊 Session type: ${sessionType}`);

			if (session.status === "completed") {
				console.log("✅ Session already completed:", sessionId);
				return false;
			}

			if (session.status !== "in_progress") {
				console.log("⏳ Session not in progress:", session.status);
				return false;
			}

			// Step 2: Check if all participants have submitted
			// Use session-type-aware check
			const allSubmitted = await this.checkAllSubmittedForSession(
				sessionId,
				sessionType
			);

			if (!allSubmitted) {
				console.log("⏳ Not all participants have fully submitted yet");
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
				if (sessionType === "collaboration") {
					// Handle collaboration-specific finalization
					await this.finalizeCollaborationSession(
						sessionId,
						session.problem_id
					);
				} else {
					// Handle match finalization (existing logic)
					console.log("📊 Calculating rankings...");
					await matchService.calculateRankings(sessionId);
					console.log("✅ Rankings calculated");

					await new Promise((resolve) => setTimeout(resolve, 200));

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
						await matchService.calculateRankings(sessionId);
						await new Promise((resolve) => setTimeout(resolve, 200));
					}

					console.log("📝 Recording session history...");
					await matchService.recordSessionHistory(sessionId);
					console.log("✅ Session history recorded");
				}

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
				await this.createSummaryNotifications(sessionId, sessionType);
				console.log("✅ Notifications created");

				console.log(
					`🎉 ${sessionType} session finalized successfully:`,
					sessionId
				);
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
			console.error("💥 Error in checkAndFinalizeSession:", error);
			return false;
		} finally {
			this.releaseLock(sessionId);
		}
	},

	/**
	 * Finalize a collaboration session - handles team-based ELO and history
	 */
	async finalizeCollaborationSession(
		sessionId: string,
		problemId: string
	): Promise<void> {
		console.log("🤝 Finalizing collaboration session...");

		// Get all participants with their final submission data
		const { data: participants, error: participantsError } = await supabase
			.from("session_participants")
			.select(
				`
				id,
				user_id,
				is_correct,
				submission_time,
				test_results,
				code_snapshot,
				user:profiles(collaboration_rating, collaboration_solved)
			`
			)
			.eq("session_id", sessionId)
			.eq("status", "joined");

		if (participantsError || !participants) {
			throw new Error("Failed to get participants for collaboration");
		}

		// Log the state for debugging
		console.log(
			"📊 Participants data:",
			participants.map((p) => ({
				user_id: p.user_id,
				is_correct: p.is_correct,
				has_code: !!p.code_snapshot,
				test_results: p.test_results,
			}))
		);

		// Determine if the team succeeded (any participant got it correct - they share code)
		const teamSuccess = participants.some((p) => p.is_correct);
		console.log(`📊 Team success: ${teamSuccess}`);

		// Calculate ELO changes for all team members
		const ratingChanges = await this.calculateCollaborationRatingChanges(
			participants,
			teamSuccess,
			problemId
		);

		// Update each participant's rating and create history records
		for (const participant of participants) {
			const ratingChange = ratingChanges.get(participant.user_id) || 0;
			const userProfile = participant.user as any;
			const currentRating = userProfile?.collaboration_rating || 1000;
			const currentSolved = userProfile?.collaboration_solved || 0;
			const newRating = Math.max(0, currentRating + ratingChange);

			// Update profile rating and solved count
			const updateData: any = {
				collaboration_rating: newRating,
			};

			if (teamSuccess) {
				updateData.collaboration_solved = currentSolved + 1;
			}

			const { error: updateError } = await supabase
				.from("profiles")
				.update(updateData)
				.eq("id", participant.user_id);

			if (updateError) {
				console.error(
					`❌ Error updating rating for ${participant.user_id}:`,
					updateError
				);
			}

			// Create session history record
			const { error: historyError } = await supabase
				.from("session_history")
				.insert({
					user_id: participant.user_id,
					session_id: sessionId,
					problem_id: problemId,
					result: teamSuccess ? "win" : "loss",
					ranking: 1, // No ranking in collaboration - all team members equal
					rating_change: ratingChange,
					completed: true,
					type: "collaboration",
				});

			if (historyError) {
				console.error(
					`❌ Error creating history for ${participant.user_id}:`,
					historyError
				);
			}

			console.log(
				`✅ Updated ${participant.user_id}: ${currentRating} → ${newRating} (${
					ratingChange > 0 ? "+" : ""
				}${ratingChange})`
			);
		}

		console.log("✅ Collaboration session finalized");
	},

	/**
	 * Calculate ELO rating changes for collaboration participants
	 */
	async calculateCollaborationRatingChanges(
		participants: any[],
		teamSuccess: boolean,
		problemId: string
	): Promise<Map<string, number>> {
		const ratingChanges = new Map<string, number>();

		// Get problem difficulty for ELO calculation
		const { data: problem } = await supabase
			.from("problems")
			.select("difficulty")
			.eq("id", problemId)
			.single();

		const difficulty = problem?.difficulty || "Medium";

		// Difficulty multiplier - harder problems give more/lose more
		const difficultyMultiplier: Record<string, number> = {
			Easy: 0.8,
			Medium: 1.0,
			Hard: 1.3,
		};

		const multiplier = difficultyMultiplier[difficulty] || 1.0;

		// Get historical success rate for this problem to calculate expected score
		const { data: historicalSessions } = await supabase
			.from("sessions")
			.select(
				`
				id,
				session_participants!inner(is_correct)
			`
			)
			.eq("problem_id", problemId)
			.eq("type", "collaboration")
			.eq("status", "completed")
			.limit(100);

		let expectedWinRate = 0.5; // Default 50% if no historical data

		if (historicalSessions && historicalSessions.length > 0) {
			const successfulSessions = historicalSessions.filter((s) =>
				(s.session_participants as any[]).some((p) => p.is_correct)
			).length;
			expectedWinRate = successfulSessions / historicalSessions.length;
			// Clamp to reasonable range
			expectedWinRate = Math.max(0.1, Math.min(0.9, expectedWinRate));
		}

		console.log(
			`📊 Problem difficulty: ${difficulty}, Expected win rate: ${(
				expectedWinRate * 100
			).toFixed(1)}%`
		);

		// Calculate rating change for each participant
		for (const participant of participants) {
			const currentRating =
				(participant.user as any)?.collaboration_rating || 1000;

			// ELO formula: change = K * multiplier * (actual - expected)
			const actual = teamSuccess ? 1 : 0;
			const expected = expectedWinRate;

			// Adjust K-factor based on rating (lower K for higher rated players for stability)
			let kFactor = this.ELO_K_FACTOR;
			if (currentRating > 1500) kFactor = 24;
			if (currentRating > 2000) kFactor = 16;
			if (currentRating < 800) kFactor = 40; // Higher volatility for new players

			const ratingChange = Math.round(
				kFactor * multiplier * (actual - expected)
			);

			// Cap the maximum loss to prevent huge drops
			const cappedChange = Math.max(-50, Math.min(50, ratingChange));

			ratingChanges.set(participant.user_id, cappedChange);
		}

		return ratingChanges;
	},

	// Alias for backward compatibility
	async checkAndFinalizeMatch(sessionId: string): Promise<boolean> {
		return this.checkAndFinalizeSession(sessionId);
	},

	/**
	 * Create notifications for session summary
	 */
	async createSummaryNotifications(
		sessionId: string,
		sessionType: SessionType = "match"
	): Promise<void> {
		try {
			console.log(
				`📧 Creating ${sessionType} notifications for session:`,
				sessionId
			);

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
			const notificationType =
				sessionType === "collaboration"
					? "collaboration_completed"
					: "match_completed";

			const newNotifications = participants
				.filter((p) => !existingUserIds.has(p.user_id))
				.map((p) => ({
					user_id: p.user_id,
					session_id: sessionId,
					type: notificationType,
					session_type: sessionType,
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
				console.log(
					`✅ Created ${newNotifications.length} ${sessionType} notifications`
				);
			}
		} catch (error) {
			console.error("💥 Error in createSummaryNotifications:", error);
		}
	},

	/**
	 * Setup global listener for all active sessions (both match and collaboration)
	 */
	setupGlobalListener(): void {
		if (this.globalCompletionListener) {
			console.log("ℹ️ Global completion listener already running");
			return;
		}

		console.log("🌐 Starting global session completion listener");

		this.globalCompletionListener = supabase
			.channel("global-session-completion")
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
					const testResults = participant.test_results as any;
					const oldTestResults = oldParticipant?.test_results as any;

					// For collaboration: trigger when final_submission becomes true
					// For match: trigger when submission_time is set
					const isFinalSubmission =
						testResults?.final_submission === true &&
						oldTestResults?.final_submission !== true;
					const isNewSubmission =
						participant.submission_time && !oldParticipant?.submission_time;

					if (isFinalSubmission || isNewSubmission) {
						console.log(
							"📊 Detected submission for session:",
							participant.session_id,
							isFinalSubmission ? "(final)" : "(new)"
						);

						// Add delay to let other updates settle
						await new Promise((resolve) => setTimeout(resolve, 500));

						await this.checkAndFinalizeSession(participant.session_id);
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
		const channelName = `session-completion:${sessionId}:${Date.now()}`;

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
					const testResults = participant.test_results as any;
					const oldTestResults = oldParticipant?.test_results as any;

					// Trigger on final_submission or submission_time change
					const isFinalSubmission =
						testResults?.final_submission === true &&
						oldTestResults?.final_submission !== true;
					const isNewSubmission =
						participant.submission_time && !oldParticipant?.submission_time;

					if (isFinalSubmission || isNewSubmission) {
						console.log(
							"📊 Participant submitted, checking if session complete"
						);

						await new Promise((resolve) => setTimeout(resolve, 300));

						await this.checkAndFinalizeSession(sessionId);
					}
				}
			)
			.subscribe((status) => {
				console.log(
					`📡 Session completion subscription (${sessionId}):`,
					status
				);
			});

		return () => {
			supabase.removeChannel(channel);
		};
	},

	/**
	 * Manual finalization trigger (for debugging)
	 */
	async forceFinalize(sessionId: string): Promise<boolean> {
		console.log("⚠️ Force finalizing session:", sessionId);

		try {
			// Get session type and problem
			const { data: session } = await supabase
				.from("sessions")
				.select("type, problem_id")
				.eq("id", sessionId)
				.single();

			const sessionType: SessionType = session?.type || "match";

			if (sessionType === "collaboration") {
				await this.finalizeCollaborationSession(sessionId, session?.problem_id);
			} else {
				await matchService.calculateRankings(sessionId);
				await matchService.recordSessionHistory(sessionId);
			}

			await supabase
				.from("sessions")
				.update({
					status: "completed",
					ended_at: new Date().toISOString(),
				})
				.eq("id", sessionId);

			await this.createSummaryNotifications(sessionId, sessionType);

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
