import { supabase } from "../lib/supabase";
import { sessionService } from "./sessionService";
import { userService } from "./userService";
import { codeAnalyzerService } from "./codeAnalyzerService";
import type { SessionType } from "../types/database";

export const matchService = {
	/**
	 * Calculate rankings after session ends
	 */
	async calculateRankings(sessionId: string): Promise<void> {
		console.log("📊 Starting ranking calculation for session:", sessionId);

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
			console.warn("⚠️ No joined participants to rank");
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

		// Sort by: is_correct (true first), then by submission_time
		const ranked = [...participants].sort((a, b) => {
			const aCorrect = a.is_correct === true;
			const bCorrect = b.is_correct === true;

			if (aCorrect !== bCorrect) {
				return aCorrect ? -1 : 1;
			}

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
			}))
		);

		// Update rankings
		for (let i = 0; i < ranked.length; i++) {
			const participant = ranked[i];
			const newRanking = i + 1;

			console.log(
				`📊 Setting ranking ${newRanking} for ${participant.user_id}`
			);

			const { data, error } = await supabase
				.from("session_participants")
				.update({ ranking: newRanking })
				.eq("id", participant.id)
				.eq("session_id", sessionId)
				.select();

			if (error) {
				console.error(`❌ Error updating ranking:`, error);
				throw error;
			}

			if (!data || data.length === 0) {
				console.log("⚠️ Primary update failed, trying fallback...");
				const { data: fallbackData, error: fallbackError } = await supabase
					.from("session_participants")
					.update({ ranking: newRanking })
					.eq("session_id", sessionId)
					.eq("user_id", participant.user_id)
					.eq("status", "joined")
					.select();

				if (fallbackError || !fallbackData?.length) {
					throw new Error(
						`Failed to update ranking for ${participant.user_id}`
					);
				}
			}

			console.log(`✅ Ranking ${newRanking} set for ${participant.user_id}`);
		}

		console.log("✅ All rankings calculated successfully");
	},

	/**
	 * Record session history and update ratings
	 */
	async recordSessionHistory(sessionId: string): Promise<void> {
		console.log("📝 Recording session history for:", sessionId);

		const session = await sessionService.getSessionById(sessionId);
		if (!session) {
			console.error("❌ Session not found");
			return;
		}

		const sessionType: SessionType = session.type || "match";

		const { data: participants, error: fetchError } = await supabase
			.from("session_participants")
			.select("*")
			.eq("session_id", sessionId)
			.eq("status", "joined");

		if (fetchError) throw fetchError;
		if (!participants?.length) return;

		// Verify rankings
		const unranked = participants.filter((p) => p.ranking == null);
		if (unranked.length > 0) {
			console.log("🔄 Re-calculating rankings...");
			await this.calculateRankings(sessionId);

			const { data: refreshed } = await supabase
				.from("session_participants")
				.select("*")
				.eq("session_id", sessionId)
				.eq("status", "joined");

			if (refreshed) {
				participants.length = 0;
				participants.push(...refreshed);
			}
		}

		const winner = participants.find((p) => p.ranking === 1);
		console.log("🏆 Winner:", winner?.user_id);

		// Determine which table to use
		const historyTable = "session_history";
		let useSessionHistory = true;

		// Check if session_history table exists
		const { error: tableCheckError } = await supabase
			.from("session_history")
			.select("id")
			.limit(1);

		if (tableCheckError && tableCheckError.code === "42P01") {
			useSessionHistory = false;
		}

		for (const participant of participants) {
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
				type: sessionType,
			});

			// Check for existing history
			const tableName = useSessionHistory ? "session_history" : "match_history";
			const { data: existing } = await supabase
				.from(tableName)
				.select("id")
				.eq("session_id", sessionId)
				.eq("user_id", participant.user_id)
				.single();

			if (existing) {
				console.log(`ℹ️ History already exists for ${participant.user_id}`);
				continue;
			}

			// Insert history
			const historyData: any = {
				user_id: participant.user_id,
				session_id: sessionId,
				problem_id: session.problem_id,
				result,
				ranking: participant.ranking,
				rating_change: ratingChange,
				completed: participant.is_correct || false,
			};

			if (useSessionHistory) {
				historyData.type = sessionType;
			}

			const { error: historyError } = await supabase
				.from(tableName)
				.insert(historyData);

			if (historyError) {
				console.error(`❌ Error inserting history:`, historyError);
				continue;
			}

			// Update user rating and solved count
			const profile = await userService.getProfileById(participant.user_id);
			if (profile) {
				const updates: any = {};

				if (sessionType === "match") {
					updates.match_rating = Math.max(
						0,
						(profile.match_rating || profile.rating || 1500) + ratingChange
					);
					updates.rating = updates.match_rating; // Backward compatibility

					if (participant.is_correct) {
						updates.match_solved =
							(profile.match_solved || profile.problems_solved || 0) + 1;
						updates.problems_solved = updates.match_solved; // Backward compatibility
					}
				} else {
					updates.collaboration_rating = Math.max(
						0,
						(profile.collaboration_rating || 1500) + ratingChange
					);

					if (participant.is_correct) {
						updates.collaboration_solved =
							(profile.collaboration_solved || 0) + 1;
					}
				}

				const { error: profileError } = await supabase
					.from("profiles")
					.update(updates)
					.eq("id", participant.user_id);

				if (profileError) {
					console.error(`❌ Error updating profile:`, profileError);
				} else {
					console.log(`✅ Profile updated for ${participant.user_id}`);
				}
			}
		}

		console.log("✅ Session history recording complete");
	},

	// Alias for backward compatibility
	async recordMatchHistory(sessionId: string): Promise<void> {
		return this.recordSessionHistory(sessionId);
	},

	/**
	 * Calculate ELO-style rating change
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
	 * Get match/session summary data
	 */
	async getMatchSummary(sessionId: string): Promise<any> {
		console.log("📊 Getting session summary for:", sessionId);

		const session = await sessionService.getSessionById(sessionId);
		if (!session) throw new Error("Session not found");

		const sessionType: SessionType = session.type || "match";

		const { data: participants, error } = await supabase
			.from("session_participants")
			.select(`*, user:profiles(*)`)
			.eq("session_id", sessionId)
			.eq("status", "joined");

		if (error) throw error;
		if (!participants?.length) throw new Error("No participants found");

		const participantsWithData = await Promise.all(
			participants.map(async (p) => {
				const profile = p.user || (await userService.getProfileById(p.user_id));

				const complexityAnalysis = codeAnalyzerService.analyzeComplexity(
					p.code_snapshot,
					session.language
				);

				const testResults = p.test_results || {};
				const passedCount = testResults.passedCount || 0;
				const totalCount = testResults.totalCount || 0;
				const passRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

				const submissionTime = p.submission_time
					? new Date(p.submission_time).toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
					  })
					: "N/A";

				const timeInSeconds =
					session.started_at && p.submission_time
						? Math.floor(
								(new Date(p.submission_time).getTime() -
									new Date(session.started_at).getTime()) /
									1000
						  )
						: 0;

				const minutes = Math.floor(timeInSeconds / 60);
				const seconds = timeInSeconds % 60;
				const formattedTime = `${minutes}:${seconds
					.toString()
					.padStart(2, "0")}`;

				// Get current rating based on session type
				const currentRating =
					sessionType === "match"
						? profile?.match_rating ?? profile?.rating ?? 1500
						: profile?.collaboration_rating ?? 1500;

				// Try to get rating change from session_history first, then match_history
				let actualRatingChange = 0;
				const { data: historyEntry } = await supabase
					.from("session_history")
					.select("rating_change")
					.eq("session_id", sessionId)
					.eq("user_id", p.user_id)
					.single();

				if (historyEntry) {
					actualRatingChange = historyEntry.rating_change || 0;
				} else {
					const { data: matchHistoryEntry } = await supabase
						.from("match_history")
						.select("rating_change")
						.eq("session_id", sessionId)
						.eq("user_id", p.user_id)
						.single();
					actualRatingChange = matchHistoryEntry?.rating_change || 0;
				}

				const previousRating = currentRating - actualRatingChange;
				const actualRanking = p.ranking ?? 999;

				return {
					name: profile?.username || "Unknown",
					avatar: profile?.avatar_url || null,
					rank: actualRanking,
					timeToSolve: timeInSeconds,
					formattedTime,
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
					currentRating,
					previousRating,
					ratingChange: actualRatingChange,
					role: p.role,
				};
			})
		);

		const sortedPlayers = participantsWithData.sort((a, b) => a.rank - b.rank);
		const winner = sortedPlayers.find((p) => p.rank === 1);

		return {
			problemName: session.problem?.title || "Problem",
			difficulty: session.problem?.difficulty || "Medium",
			totalParticipants: participantsWithData.length,
			winner: winner?.name || "N/A",
			winnerTime: winner?.formattedTime || "N/A",
			problemDescription: session.problem?.description || "",
			players: sortedPlayers,
			session,
			sessionType,
		};
	},

	/**
	 * Check if all participants have submitted
	 */
	async checkAllSubmitted(sessionId: string): Promise<boolean> {
		const { data: participants, error } = await supabase
			.from("session_participants")
			.select("id, user_id, submission_time, status, role")
			.eq("session_id", sessionId)
			.eq("status", "joined")
			.neq("role", "viewer"); // Viewers don't need to submit

		if (error) {
			console.error("❌ Error checking submissions:", error);
			return false;
		}

		if (!participants?.length) return false;

		const allSubmitted = participants.every((p) => p.submission_time !== null);

		console.log("📊 Submission check:", {
			total: participants.length,
			submitted: participants.filter((p) => p.submission_time !== null).length,
			allSubmitted,
		});

		return allSubmitted;
	},
};
