import { supabase } from "../lib/supabase";
import { sessionService } from "./sessionService";
import { userService } from "./userService";

export const matchService = {
	// Calculate rankings after session ends
	async calculateRankings(sessionId: string): Promise<void> {
		const participants = await sessionService.getSessionParticipants(sessionId);

		// Sort by: is_correct (true first), then by submission_time
		const ranked = participants
			.filter((p) => p.status === "joined")
			.sort((a, b) => {
				if (a.is_correct !== b.is_correct) {
					return a.is_correct ? -1 : 1;
				}
				if (!a.submission_time || !b.submission_time) return 0;
				return (
					new Date(a.submission_time).getTime() -
					new Date(b.submission_time).getTime()
				);
			});

		// Update rankings
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

					// Calculate time taken (in minutes)
					const timeTaken =
						session.started_at && p.submission_time
							? Math.floor(
									(new Date(p.submission_time).getTime() -
										new Date(session.started_at).getTime()) /
										60000
							  )
							: 0;

					return {
						name: profile?.username || "Unknown",
						avatar: profile?.avatar_url || null,
						rank: p.ranking || 999,
						timeToSolve: timeTaken,
						timeComplexity: "O(n)", // You can enhance this with actual complexity analysis
						spaceComplexity: "O(1)", // You can enhance this with actual complexity analysis
						passedTestCases: Math.round(passRate),
						codeQualityScore: passRate, // Simplified - can be enhanced
						bestPracticeScore: passRate,
						optimizationScore: passRate,
						readabilityScore: passRate,
						submissionTime,
						solutionApproach: "User Solution",
						initial: (profile?.username || "U").charAt(0).toUpperCase(),
						bgColor:
							p.ranking === 1
								? "#FF6B6B"
								: p.ranking === 2
								? "#FFD93D"
								: "#6BCB77",
						textColor: p.ranking === 1 ? "text-white" : "text-gray-900",
						isCorrect: p.is_correct,
						userId: p.user_id,
					};
				})
		);

		return {
			problemName: session.problem?.title || "Problem",
			difficulty: session.problem?.difficulty || "Medium",
			totalParticipants: participantsWithData.length,
			winner: participantsWithData.find((p) => p.rank === 1)?.name || "N/A",
			problemDescription: session.problem?.description || "",
			players: participantsWithData.sort((a, b) => a.rank - b.rank),
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
