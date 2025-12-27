import { supabase } from "../lib/supabase";
import { sessionService } from "./sessionService";
import { userService } from "./userService";
import { codeAnalyzerService } from "./codeAnalyzerService";

export const matchService = {
	/**
	 * Calculate rankings after session ends
	 * Uses atomic updates to prevent race conditions
	 */
	async calculateRankings(sessionId: string): Promise<void> {
		console.log("📊 Starting ranking calculation for session:", sessionId);

		// Get fresh participant data directly from the database
		// to avoid any caching issues
		const { data: participants, error: fetchError } = await supabase
			.from("session_participants")
			.select("*")
			.eq("session_id", sessionId)
			.eq("status", "joined");

		if (fetchError) {
			console.error("❌ Error fetching participants:", fetchError);
			throw fetchError;
		}

		if (!participants || participants.length === 0) {
			console.warn("⚠️ No joined participants to rank for session:", sessionId);
			return;
		}

		console.log(
			"📊 Participants for ranking:",
			participants.map((p) => ({
				id: p.id,
				user_id: p.user_id,
				is_correct: p.is_correct,
				submission_time: p.submission_time,
			}))
		);

		// Sort by: is_correct (true first), then by submission_time (earlier is better)
		const ranked = [...participants].sort((a, b) => {
			// First priority: correctness (true before false)
			// Handle null/undefined is_correct as false
			const aCorrect = a.is_correct === true;
			const bCorrect = b.is_correct === true;

			if (aCorrect !== bCorrect) {
				return aCorrect ? -1 : 1;
			}

			// Second priority: submission time (earlier is better)
			// Handle null submission times - no submission goes last
			if (!a.submission_time && !b.submission_time) return 0;
			if (!a.submission_time) return 1;
			if (!b.submission_time) return -1;

			return (
				new Date(a.submission_time).getTime() -
				new Date(b.submission_time).getTime()
			);
		});

		console.log(
			"📊 Ranked order:",
			ranked.map((p, i) => ({
				rank: i + 1,
				id: p.id,
				user_id: p.user_id,
				is_correct: p.is_correct,
				submission_time: p.submission_time,
			}))
		);

		// Update rankings one by one with proper error handling
		// We do this sequentially to avoid race conditions
		for (let i = 0; i < ranked.length; i++) {
			const participant = ranked[i];
			const newRanking = i + 1;

			console.log(
				`📊 Setting ranking ${newRanking} for participant ${participant.id} (user: ${participant.user_id})`
			);

			const { data, error } = await supabase
				.from("session_participants")
				.update({ ranking: newRanking })
				.eq("id", participant.id)
				.eq("session_id", sessionId) // Extra safety: ensure we're updating the right session
				.select();

			if (error) {
				console.error(
					`❌ Error updating ranking for participant ${participant.id}:`,
					error
				);
				throw error;
			}

			if (!data || data.length === 0) {
				console.error(
					`❌ No rows updated for participant ${participant.id} - participant may not exist`
				);

				// Try to verify the participant exists
				const { data: verifyData } = await supabase
					.from("session_participants")
					.select("id, session_id, user_id")
					.eq("id", participant.id)
					.single();

				console.log("🔍 Verification query result:", verifyData);

				// If participant doesn't exist with that ID, try updating by user_id and session_id
				console.log(
					"🔄 Attempting fallback update by user_id and session_id..."
				);
				const { data: fallbackData, error: fallbackError } = await supabase
					.from("session_participants")
					.update({ ranking: newRanking })
					.eq("session_id", sessionId)
					.eq("user_id", participant.user_id)
					.eq("status", "joined")
					.select();

				if (fallbackError) {
					console.error("❌ Fallback update also failed:", fallbackError);
					throw new Error(
						`Failed to update ranking for user ${participant.user_id} in session ${sessionId}`
					);
				}

				if (!fallbackData || fallbackData.length === 0) {
					console.error("❌ Fallback update affected 0 rows");
					throw new Error(
						`Failed to update ranking for user ${participant.user_id} - no matching record`
					);
				}

				console.log(
					`✅ Fallback update succeeded for user ${participant.user_id}`
				);
			} else {
				console.log(
					`✅ Ranking ${newRanking} set for participant ${participant.id} (user: ${participant.user_id})`
				);
			}
		}

		// Verify rankings were set correctly
		const { data: verifiedParticipants, error: verifyError } = await supabase
			.from("session_participants")
			.select("id, user_id, ranking, is_correct")
			.eq("session_id", sessionId)
			.eq("status", "joined");

		if (verifyError) {
			console.error("❌ Error verifying rankings:", verifyError);
		} else {
			console.log("📊 Ranking verification:", verifiedParticipants);

			// Check if any rankings are still null
			const nullRankings =
				verifiedParticipants?.filter((p) => p.ranking === null) || [];
			if (nullRankings.length > 0) {
				console.error(
					"❌ Some rankings are still null after update:",
					nullRankings
				);
				throw new Error(
					`Failed to set rankings for ${nullRankings.length} participants`
				);
			}
		}

		console.log("✅ All rankings calculated and verified successfully");
	},

	/**
	 * Record match history and update ratings
	 * Must be called AFTER rankings are verified
	 */
	async recordMatchHistory(sessionId: string): Promise<void> {
		console.log("📝 Recording match history for session:", sessionId);

		const session = await sessionService.getSessionById(sessionId);
		if (!session) {
			console.error("❌ Session not found for match history");
			return;
		}

		// Get participants with verified rankings directly from DB
		const { data: participants, error: fetchError } = await supabase
			.from("session_participants")
			.select("*")
			.eq("session_id", sessionId)
			.eq("status", "joined");

		if (fetchError) {
			console.error("❌ Error fetching participants for history:", fetchError);
			throw fetchError;
		}

		if (!participants || participants.length === 0) {
			console.error("❌ No participants found for match history");
			return;
		}

		console.log(
			"📝 Recording history for participants:",
			participants.map((p) => ({
				user_id: p.user_id,
				ranking: p.ranking,
				is_correct: p.is_correct,
			}))
		);

		// Verify all rankings are set before proceeding
		const unrankedParticipants = participants.filter(
			(p) => p.ranking === null || p.ranking === undefined
		);

		if (unrankedParticipants.length > 0) {
			console.error(
				"❌ Cannot record match history - some participants have no ranking:",
				unrankedParticipants.map((p) => p.user_id)
			);
			// Re-calculate rankings before proceeding
			console.log("🔄 Re-calculating rankings...");
			await this.calculateRankings(sessionId);

			// Reload participants after recalculation
			const { data: refreshedParticipants } = await supabase
				.from("session_participants")
				.select("*")
				.eq("session_id", sessionId)
				.eq("status", "joined");

			if (refreshedParticipants) {
				participants.length = 0;
				participants.push(...refreshedParticipants);
			}
		}

		// Find the winner (rank 1)
		const winner = participants.find((p) => p.ranking === 1);
		console.log("🏆 Winner:", winner?.user_id, "ranking:", winner?.ranking);

		for (const participant of participants) {
			// Determine result based on ranking
			// Rank 1 = win, others = loss
			const isWinner = participant.ranking === 1;
			const result = isWinner ? "win" : "loss";
			const ratingChange = this.calculateEloRatingChange(
				participant.ranking || 999,
				participants.length
			);

			console.log(`📝 Recording for ${participant.user_id}:`, {
				result,
				ranking: participant.ranking,
				ratingChange,
				is_correct: participant.is_correct,
			});

			// Check if history already exists to avoid duplicates
			const { data: existingHistory } = await supabase
				.from("match_history")
				.select("id")
				.eq("session_id", sessionId)
				.eq("user_id", participant.user_id)
				.single();

			if (existingHistory) {
				console.log(
					`ℹ️ Match history already exists for ${participant.user_id}, skipping`
				);
				continue;
			}

			// Insert match history
			const { error: historyError } = await supabase
				.from("match_history")
				.insert({
					user_id: participant.user_id,
					session_id: sessionId,
					problem_id: session.problem_id,
					result,
					ranking: participant.ranking,
					rating_change: ratingChange,
					completed: participant.is_correct || false,
				});

			if (historyError) {
				console.error(
					`❌ Error inserting match history for ${participant.user_id}:`,
					historyError
				);
				continue;
			}

			// Update user rating and problems solved
			const profile = await userService.getProfileById(participant.user_id);
			if (profile) {
				const newRating = Math.max(0, profile.rating + ratingChange);
				const newProblemsSolved = participant.is_correct
					? profile.problems_solved + 1
					: profile.problems_solved;

				const { error: profileError } = await supabase
					.from("profiles")
					.update({
						rating: newRating,
						problems_solved: newProblemsSolved,
					})
					.eq("id", participant.user_id);

				if (profileError) {
					console.error(
						`❌ Error updating profile for ${participant.user_id}:`,
						profileError
					);
				} else {
					console.log(`✅ Profile updated for ${participant.user_id}:`, {
						oldRating: profile.rating,
						newRating,
						ratingChange,
					});
				}
			}
		}

		console.log("✅ Match history recording complete");
	},

	/**
	 * Calculate ELO-style rating change based on ranking and participant count
	 */
	calculateEloRatingChange(ranking: number, totalParticipants: number): number {
		const basePoints = 10;

		if (ranking === 1) {
			return basePoints + (totalParticipants - 1) * 2;
		} else if (ranking === 2 && totalParticipants > 2) {
			return -Math.floor(basePoints / 2);
		} else {
			return -basePoints;
		}
	},

	/**
	 * Get match summary data with dynamic complexity analysis
	 */
	async getMatchSummary(sessionId: string): Promise<any> {
		console.log("📊 Getting match summary for session:", sessionId);

		const session = await sessionService.getSessionById(sessionId);
		if (!session) throw new Error("Session not found");

		// Get participants directly from DB
		const { data: participants, error } = await supabase
			.from("session_participants")
			.select(
				`
				*,
				user:profiles(*)
			`
			)
			.eq("session_id", sessionId)
			.eq("status", "joined");

		if (error) {
			console.error("❌ Error fetching participants for summary:", error);
			throw error;
		}

		if (!participants || participants.length === 0) {
			throw new Error("No participants found for this session");
		}

		// Get participants with all data
		const participantsWithData = await Promise.all(
			participants.map(async (p) => {
				const profile = p.user || (await userService.getProfileById(p.user_id));

				// Analyze code complexity
				const complexityAnalysis = codeAnalyzerService.analyzeComplexity(
					p.code_snapshot,
					session.language
				);

				// Calculate test case pass rate
				const testResults = p.test_results || {};
				const passedCount = testResults.passedCount || 0;
				const totalCount = testResults.totalCount || 0;
				const passRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

				// Parse submission time
				const submissionTime = p.submission_time
					? new Date(p.submission_time).toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
					  })
					: "N/A";

				// Calculate time taken (in seconds)
				const timeInSeconds =
					session.started_at && p.submission_time
						? Math.floor(
								(new Date(p.submission_time).getTime() -
									new Date(session.started_at).getTime()) /
									1000
						  )
						: 0;

				// Format time as MM:SS
				const minutes = Math.floor(timeInSeconds / 60);
				const seconds = timeInSeconds % 60;
				const formattedTime = `${minutes}:${seconds
					.toString()
					.padStart(2, "0")}`;

				// Get rating info from match_history
				const currentRating = profile?.rating || 1500;

				const { data: historyEntry } = await supabase
					.from("match_history")
					.select("rating_change")
					.eq("session_id", sessionId)
					.eq("user_id", p.user_id)
					.single();

				const actualRatingChange = historyEntry?.rating_change || 0;
				const previousRating = currentRating - actualRatingChange;

				// Use actual ranking from database
				const actualRanking = p.ranking ?? 999;

				return {
					name: profile?.username || "Unknown",
					avatar: profile?.avatar_url || null,
					rank: actualRanking,
					timeToSolve: timeInSeconds,
					formattedTime: formattedTime,
					timeComplexity: complexityAnalysis.timeComplexity,
					spaceComplexity: complexityAnalysis.spaceComplexity,
					complexityConfidence: complexityAnalysis.confidence,
					passedTestCases: Math.round(passRate),
					passedTestCount: passedCount,
					totalTestCount: totalCount,
					codeQualityScore: passRate,
					bestPracticeScore: passRate,
					optimizationScore: passRate,
					readabilityScore: passRate,
					submissionTime,
					solutionApproach: "User Solution",
					initial: (profile?.username || "U").charAt(0).toUpperCase(),
					bgColor:
						actualRanking === 1
							? "#FFD93D"
							: actualRanking === 2
							? "#C0C0C0"
							: "#CD7F32",
					textColor: "text-gray-900",
					isCorrect: p.is_correct === true,
					userId: p.user_id,
					currentRating: currentRating,
					previousRating: previousRating,
					ratingChange: actualRatingChange,
				};
			})
		);

		// Sort by rank
		const sortedPlayers = participantsWithData.sort((a, b) => a.rank - b.rank);

		// Winner is the player with rank 1
		const winner = sortedPlayers.find((p) => p.rank === 1);

		console.log("🏆 Match Summary:", {
			players: sortedPlayers.map((p) => ({
				name: p.name,
				rank: p.rank,
				isCorrect: p.isCorrect,
				timeComplexity: p.timeComplexity,
				spaceComplexity: p.spaceComplexity,
			})),
			winner: winner?.name,
		});

		return {
			problemName: session.problem?.title || "Problem",
			difficulty: session.problem?.difficulty || "Medium",
			totalParticipants: participantsWithData.length,
			winner: winner?.name || "N/A",
			winnerTime: winner?.formattedTime || "N/A",
			problemDescription: session.problem?.description || "",
			players: sortedPlayers,
			session,
		};
	},

	/**
	 * Check if all participants have submitted
	 */
	async checkAllSubmitted(sessionId: string): Promise<boolean> {
		const { data: participants, error } = await supabase
			.from("session_participants")
			.select("id, user_id, submission_time, status")
			.eq("session_id", sessionId)
			.eq("status", "joined");

		if (error) {
			console.error("❌ Error checking submissions:", error);
			return false;
		}

		if (!participants || participants.length === 0) {
			console.log("⚠️ No joined participants found");
			return false;
		}

		const allSubmitted = participants.every((p) => p.submission_time !== null);

		console.log("📊 Submission check:", {
			total: participants.length,
			submitted: participants.filter((p) => p.submission_time !== null).length,
			allSubmitted,
			participants: participants.map((p) => ({
				user_id: p.user_id,
				has_submitted: p.submission_time !== null,
			})),
		});

		return allSubmitted;
	},
};
