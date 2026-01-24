import { useState, useEffect, useCallback } from "react";
import { matchService } from "../../../services/matchService";
import { sessionService } from "../../../services/sessionService";
import { loadDistributionData } from "../utils/dataLoaders";
import type { DistributionData, SummaryData } from "../utils/types";

interface UseMatchSummaryReturn {
	loading: boolean;
	error: string | null;
	summaryData: SummaryData | null;
	distributionData: DistributionData | null;
	reload: () => void;
}

export function useMatchSummary(
	sessionId: string | undefined,
): UseMatchSummaryReturn {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
	const [distributionData, setDistributionData] =
		useState<DistributionData | null>(null);

	const loadMatchSummary = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			if (!sessionId) {
				setError("No session ID provided");
				setLoading(false);
				return;
			}

			// First, check if session is completed
			const session = await sessionService.getSessionById(sessionId);

			if (!session) {
				setError("Session not found");
				setLoading(false);
				return;
			}

			// Check if session is completed
			if (session.status !== "completed") {
				setError(
					"This match is still in progress. You'll be notified when all players have submitted their solutions.",
				);
				setLoading(false);
				return;
			}

			// Check if all participants have submitted
			const allSubmitted = await matchService.checkAllSubmitted(sessionId);

			if (!allSubmitted) {
				setError(
					"Not all players have submitted yet. Please wait for the match to complete.",
				);
				setLoading(false);
				return;
			}

			// Load summary data
			const data = await matchService.getMatchSummary(sessionId);
			setSummaryData(data);

			// Load distribution data for comparison charts
			const winner = data.players.find((p: any) => p.rank === 1);
			if (winner) {
				const distribution = await loadDistributionData(
					sessionId,
					session.problem_id,
					winner.timeToSolve,
					winner.timeComplexity,
					winner.spaceComplexity,
					session.language,
				);
				setDistributionData(distribution);
			}
		} catch (err) {
			console.error("Error loading match summary:", err);
			setError("Failed to load match summary");
		} finally {
			setLoading(false);
		}
	}, [sessionId]);

	useEffect(() => {
		loadMatchSummary();
	}, [sessionId, loadMatchSummary]);

	const reload = useCallback(() => {
		loadMatchSummary();
	}, [loadMatchSummary]);

	return {
		loading,
		error,
		summaryData,
		distributionData,
		reload,
	};
}
