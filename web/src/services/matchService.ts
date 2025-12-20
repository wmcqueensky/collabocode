import { supabase } from "../lib/supabase";
import { sessionService } from "./sessionService";
import { userService } from "./userService";

export const matchService = {
	// Calculate rankings after session ends
	async calculateRankings(sessionId: string): Promise<void> {
		const participants = await sessionService.getSessionParticipants(sessionId);

		// Sort by: is_correct (true first), then by submission_time (earlier is better)
		const ranked = participants
			.filter((p) => p.status === "joined")
			.sort((a, b) => {
				// First priority: correctness (true before false)
				if (a.is_correct !== b.is_correct) {
					return a.is_correct ? -1 : 1;
				}

				// Second priority: submission time (earlier is better)
				if (!a.submission_time || !b.submission_time) return 0;
				return (
					new Date(a.submission_time).getTime() -
					new Date(b.submission_time).getTime()
				);
			});

		console.log(
			"📊 Ranked participants:",
			ranked.map((p) => ({
				user_id: p.user_id,
				is_correct: p.is_correct,
				submission_time: p.submission_time,
				new_ranking: ranked.indexOf(p) + 1,
			}))
		);

		// Update rankings (1 = best, 2 = second, etc.)
		for (let i = 0; i < ranked.length; i++) {
			await supabase
				.from("session_participants")
				.update({ ranking: i + 1 })
				.eq("id", ranked[i].id);
		}
	},

	// Record match history and update ratings
	async recordMatchHistory(sessionId: string): Promise<void> {
		const session = await sessionService.getSessionById(sessionId);
		if (!session) return;

		const participants = await sessionService.getSessionParticipants(sessionId);
		const joinedParticipants = participants.filter(
			(p) => p.status === "joined"
		);

		for (const participant of joinedParticipants) {
			const result = participant.ranking === 1 ? "win" : "loss";
			const ratingChange = this.calculateEloRatingChange(
				participant.ranking || 999
			);

			// Insert match history
			await supabase.from("match_history").insert({
				user_id: participant.user_id,
				session_id: sessionId,
				problem_id: session.problem_id,
				result,
				ranking: participant.ranking,
				rating_change: ratingChange,
				completed: participant.is_correct,
			});

			// Update user rating and problems solved
			const profile = await userService.getProfileById(participant.user_id);
			if (profile) {
				await supabase
					.from("profiles")
					.update({
						rating: profile.rating + ratingChange,
						problems_solved: participant.is_correct
							? profile.problems_solved + 1
							: profile.problems_solved,
					})
					.eq("id", participant.user_id);
			}
		}
	},

	// Calculate ELO-style rating change
	calculateEloRatingChange(ranking: number): number {
		// Winner gets +10, loser gets -10 (simplified ELO)
		if (ranking === 1) {
			return 10;
		} else {
			return -10;
		}
	},

	// Get match summary data
	async getMatchSummary(sessionId: string): Promise<any> {
		const session = await sessionService.getSessionById(sessionId);
		if (!session) throw new Error("Session not found");

		const participants = await sessionService.getSessionParticipants(sessionId);

		// Get profiles with updated ratings
		const participantsWithData = await Promise.all(
			participants
				.filter((p) => p.status === "joined")
				.map(async (p) => {
					const profile = await userService.getProfileById(p.user_id);

					// Calculate test case pass rate
					const testResults = p.test_results || {};
					const passedCount = testResults.passedCount || 0;
					const totalCount = testResults.totalCount || 0;
					const passRate =
						totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

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

					// Get previous rating (current rating minus the change)
					const currentRating = profile?.rating || 1500;
					// Use actual ranking from database, fallback to 999 if null
					const actualRanking = p.ranking || 999;
					const ratingChange = actualRanking === 1 ? 10 : -10;
					const previousRating = currentRating - ratingChange;

					return {
						name: profile?.username || "Unknown",
						avatar: profile?.avatar_url || null,
						rank: actualRanking,
						timeToSolve: timeInSeconds,
						formattedTime: formattedTime,
						timeComplexity: "O(n)", // Placeholder - can be enhanced
						spaceComplexity: "O(1)", // Placeholder - can be enhanced
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
								? "#FF6B6B"
								: actualRanking === 2
								? "#FFD93D"
								: "#6BCB77",
						textColor: actualRanking === 1 ? "text-white" : "text-gray-900",
						isCorrect: p.is_correct,
						userId: p.user_id,
						currentRating: currentRating,
						previousRating: previousRating,
						ratingChange: ratingChange,
					};
				})
		);

		// Sort by rank (1, 2, 3, etc.) - lowest rank number is best
		const sortedPlayers = participantsWithData.sort((a, b) => a.rank - b.rank);

		// Winner is the player with rank 1
		const winner = sortedPlayers.find((p) => p.rank === 1);

		console.log("🏆 Match Summary:", {
			players: sortedPlayers.map((p) => ({
				name: p.name,
				rank: p.rank,
				isCorrect: p.isCorrect,
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

	// Check if all participants have submitted
	async checkAllSubmitted(sessionId: string): Promise<boolean> {
		const participants = await sessionService.getSessionParticipants(sessionId);
		const joinedParticipants = participants.filter(
			(p) => p.status === "joined"
		);

		return joinedParticipants.every((p) => p.submission_time !== null);
	},
};
