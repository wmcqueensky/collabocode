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

	// Record match history
	async recordMatchHistory(sessionId: string): Promise<void> {
		const session = await sessionService.getSessionById(sessionId);
		if (!session) return;

		const participants = await sessionService.getSessionParticipants(sessionId);
		const winner = participants.find((p) => p.ranking === 1);

		for (const participant of participants) {
			if (participant.status !== "joined") continue;

			const result = participant.ranking === 1 ? "win" : "loss";
			const ratingChange = this.calculateRatingChange(
				participant.ranking || 999,
				participants.length
			);

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

	// Calculate rating change based on ranking
	calculateRatingChange(ranking: number, totalPlayers: number): number {
		const basePoints = 50;
		const multiplier = (totalPlayers - ranking + 1) / totalPlayers;
		return Math.round(basePoints * multiplier * (ranking === 1 ? 2 : 1));
	},
};
