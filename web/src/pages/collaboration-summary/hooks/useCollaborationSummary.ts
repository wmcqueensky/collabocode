import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sessionService } from "../../../services/sessionService";
import { supabase } from "../../../lib/supabase";

import type {
	TeamMember,
	TeamEvaluation,
	HistoricalStats,
	DistributionData,
} from "../utils/types";

import {
	loadHistoricalStats,
	loadDistributionData,
} from "../utils/dataLoaders";
import { calculateTeamEvaluation } from "../utils/evaluationCalculator";

interface UseCollaborationSummaryProps {
	sessionId: string | undefined;
}

interface UseCollaborationSummaryReturn {
	loading: boolean;
	error: string | null;
	session: any;
	teamMembers: TeamMember[];
	teamEvaluation: TeamEvaluation | null;
	sharedCode: string;
	historicalStats: HistoricalStats | null;
	distributionData: DistributionData | null;
	reload: () => Promise<void>;
}

export function useCollaborationSummary({
	sessionId,
}: UseCollaborationSummaryProps): UseCollaborationSummaryReturn {
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [session, setSession] = useState<any>(null);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [teamEvaluation, setTeamEvaluation] = useState<TeamEvaluation | null>(
		null,
	);
	const [sharedCode, setSharedCode] = useState<string>("");
	const [historicalStats, setHistoricalStats] =
		useState<HistoricalStats | null>(null);
	const [distributionData, setDistributionData] =
		useState<DistributionData | null>(null);

	const loadCollaborationSummary = useCallback(async () => {
		if (!sessionId) {
			navigate("/explore");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// Load session
			const sessionData = await sessionService.getSessionById(sessionId);
			if (!sessionData) {
				setError("Session not found");
				return;
			}

			// Redirect if wrong session type
			if (sessionData.type !== "collaboration") {
				navigate(`/match-summary/${sessionId}`);
				return;
			}

			// Check if session is completed
			if (sessionData.status !== "completed") {
				setError(
					"This collaboration is still in progress. You'll be notified when it's complete.",
				);
				return;
			}

			setSession(sessionData);

			// Load participants with their profiles
			const { data: participants, error: participantsError } = await supabase
				.from("session_participants")
				.select(`*, user:profiles(*)`)
				.eq("session_id", sessionId)
				.eq("status", "joined");

			if (participantsError) throw participantsError;

			// Get rating changes from session_history
			const { data: historyRecords } = await supabase
				.from("session_history")
				.select("user_id, rating_change")
				.eq("session_id", sessionId)
				.eq("type", "collaboration");

			const ratingChangeMap = new Map<string, number>();
			historyRecords?.forEach((record) => {
				ratingChangeMap.set(record.user_id, record.rating_change || 0);
			});

			// Map to team members
			const members: TeamMember[] = (participants || []).map((p: any) => {
				const testResults = p.test_results || {};
				const submissionTimeMs = p.submission_time
					? new Date(p.submission_time).getTime()
					: null;
				return {
					id: p.user_id,
					name: p.user?.username || "Unknown",
					avatar: p.user?.avatar_url,
					passedTests: testResults.passedCount || 0,
					totalTests: testResults.totalCount || 0,
					submissionTime: p.submission_time
						? new Date(p.submission_time).toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
							})
						: null,
					submissionTimeMs,
					ratingBefore:
						(p.user?.collaboration_rating || 1000) -
						(ratingChangeMap.get(p.user_id) || 0),
					ratingChange: ratingChangeMap.get(p.user_id) || 0,
				};
			});

			setTeamMembers(members);

			// Get the shared code (use first participant's code snapshot)
			const codeSnapshot = participants?.[0]?.code_snapshot || "";
			setSharedCode(codeSnapshot);

			// Load historical stats for this problem
			const stats = await loadHistoricalStats(
				sessionId,
				sessionData.problem_id,
				sessionData.max_players,
				sessionData.time_limit,
			);
			setHistoricalStats(stats);

			// Calculate team evaluation with all dynamic data
			const evaluation = await calculateTeamEvaluation(
				sessionId,
				participants || [],
				sessionData,
				codeSnapshot,
				stats,
			);
			setTeamEvaluation(evaluation);

			// Load distribution data for comparison charts
			const distribution = await loadDistributionData(
				sessionId,
				sessionData.problem_id,
				sessionData.max_players,
				sessionData.time_limit,
				evaluation.solveTimeSeconds,
				evaluation.complexity,
				sessionData.language,
			);
			setDistributionData(distribution);
		} catch (err: any) {
			console.error("Error loading collaboration summary:", err);
			setError("Failed to load collaboration summary");
		} finally {
			setLoading(false);
		}
	}, [sessionId, navigate]);

	// Load data on mount and when sessionId changes
	useEffect(() => {
		loadCollaborationSummary();
	}, [loadCollaborationSummary]);

	return {
		loading,
		error,
		session,
		teamMembers,
		teamEvaluation,
		sharedCode,
		historicalStats,
		distributionData,
		reload: loadCollaborationSummary,
	};
}
