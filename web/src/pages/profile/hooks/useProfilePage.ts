import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import type {
	UserProfile,
	SessionHistory,
	Statistics,
	Leaderboards,
	ProfileTab,
} from "../types";
import { DEFAULT_STATISTICS, DEFAULT_LEADERBOARDS } from "../types";

export const useProfilePage = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
	const [statistics, setStatistics] = useState<Statistics>(DEFAULT_STATISTICS);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
	const [leaderboards, setLeaderboards] =
		useState<Leaderboards>(DEFAULT_LEADERBOARDS);

	// Load all data when user changes
	useEffect(() => {
		if (user) {
			loadProfile();
			loadSessionHistory();
			loadLeaderboards();
		}
	}, [user]);

	const loadProfile = async () => {
		if (!user) return;
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();
			if (error) throw error;
			setProfile(data);
		} catch (error) {
			console.error("Error loading profile:", error);
		}
	};

	const loadLeaderboards = async () => {
		try {
			// Load match leaderboard (top 10 by match_rating)
			const { data: matchLeaderboard, error: matchError } = await supabase
				.from("profiles")
				.select("id, username, match_rating, match_solved")
				.order("match_rating", { ascending: false })
				.limit(10);

			if (matchError) throw matchError;

			// Load collaboration leaderboard (top 10 by collaboration_rating)
			const { data: collabLeaderboard, error: collabError } = await supabase
				.from("profiles")
				.select("id, username, collaboration_rating, collaboration_solved")
				.order("collaboration_rating", { ascending: false })
				.limit(10);

			if (collabError) throw collabError;

			setLeaderboards({
				match: (matchLeaderboard || []).map((entry, index) => ({
					id: entry.id,
					username: entry.username,
					rating: entry.match_rating || 1000,
					solved: entry.match_solved || 0,
					rank: index + 1,
				})),
				collaboration: (collabLeaderboard || []).map((entry, index) => ({
					id: entry.id,
					username: entry.username,
					rating: entry.collaboration_rating || 1000,
					solved: entry.collaboration_solved || 0,
					rank: index + 1,
				})),
			});
		} catch (error) {
			console.error("Error loading leaderboards:", error);
		}
	};

	const loadSessionHistory = async () => {
		if (!user) return;
		setLoading(true);
		try {
			let history: SessionHistory[] = [];

			const { data: sessionData, error: sessionError } = await supabase
				.from("session_history")
				.select(`*, problems (title)`)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })
				.limit(30);

			if (sessionError && sessionError.code === "42P01") {
				const { data: matchData, error: matchError } = await supabase
					.from("match_history")
					.select(`*, problems (title)`)
					.eq("user_id", user.id)
					.order("created_at", { ascending: false })
					.limit(30);

				if (!matchError && matchData) {
					history = matchData.map((m: any) => ({
						...m,
						type: "match",
						problem_title: m.problems?.title || "Unknown Problem",
					}));
				}
			} else if (sessionData) {
				history = sessionData.map((s: any) => ({
					...s,
					problem_title: s.problems?.title || "Unknown Problem",
				}));
			}

			// Fetch participants for each session
			if (history.length > 0) {
				const sessionIds = [...new Set(history.map((h) => h.session_id))];

				const { data: participantsData, error: participantsError } =
					await supabase
						.from("session_participants")
						.select(
							`
						session_id,
						user_id,
						user:profiles(username)
					`,
						)
						.in("session_id", sessionIds)
						.eq("status", "joined");

				if (!participantsError && participantsData) {
					// Group participants by session_id
					const participantsBySession = new Map<
						string,
						{ user_id: string; username: string }[]
					>();

					participantsData.forEach((p: any) => {
						const sessionId = p.session_id;
						if (!participantsBySession.has(sessionId)) {
							participantsBySession.set(sessionId, []);
						}
						participantsBySession.get(sessionId)!.push({
							user_id: p.user_id,
							username: p.user?.username || "Unknown",
						});
					});

					// Add participants to history items
					history = history.map((h) => ({
						...h,
						participants: participantsBySession.get(h.session_id) || [],
					}));
				}
			}

			setSessionHistory(history);

			if (history.length > 0) {
				// Separate matches and collaborations
				const matches = history.filter((h) => h.type === "match" || !h.type);
				const collaborations = history.filter(
					(h) => h.type === "collaboration",
				);

				// Count all matches
				const matchWins = matches.filter((m) => m.ranking === 1).length;
				const matchLosses = matches.filter((m) => m.ranking > 1).length;
				const totalMatches = matchWins + matchLosses;

				// Calculate collaboration success rate
				const successfulCollaborations = collaborations.filter(
					(c) => c.result === "win" || (c.completed && c.rating_change > 0),
				).length;
				const totalCollaborations = collaborations.length;
				const collaborationSuccessRate =
					totalCollaborations > 0
						? (successfulCollaborations / totalCollaborations) * 100
						: 0;

				// Calculate average ranking for completed matches
				const completedMatches = matches.filter((m) => m.completed);
				const avgRanking =
					completedMatches.length > 0
						? completedMatches.reduce((sum, m) => sum + (m.ranking || 0), 0) /
							completedMatches.length
						: 0;

				setStatistics({
					totalMatches,
					matchWins,
					matchLosses,
					matchWinRate: totalMatches > 0 ? (matchWins / totalMatches) * 100 : 0,
					totalCollaborations,
					collaborationSuccessRate,
					collaborationSuccesses: successfulCollaborations,
					averageRanking: avgRanking,
				});
			}
		} catch (error) {
			console.error("Error loading session history:", error);
		} finally {
			setLoading(false);
		}
	};

	// Navigate to match summary
	const navigateToMatchSummary = (sessionId: string) => {
		navigate(`/match-summary/${sessionId}`);
	};

	// Navigate to collaboration summary
	const navigateToCollaborationSummary = (sessionId: string) => {
		navigate(`/collaboration-summary/${sessionId}`);
	};

	// Computed values
	const username = profile?.username || user?.email?.split("@")[0] || "User";
	const avatarLetter = username[0]?.toUpperCase() || "U";
	const matchRating = profile?.match_rating ?? profile?.rating ?? 1500;
	const collaborationRating = profile?.collaboration_rating ?? 1500;
	const matchSolved = profile?.match_solved ?? profile?.problems_solved ?? 0;
	const collaborationSolved = profile?.collaboration_solved ?? 0;
	const totalSolved = matchSolved + collaborationSolved;

	// Filter history by type
	const matchHistory = sessionHistory.filter(
		(h) => h.type === "match" || !h.type,
	);
	const collaborationHistory = sessionHistory.filter(
		(h) => h.type === "collaboration",
	);

	return {
		// Auth
		user,

		// Profile data
		profile,
		username,
		avatarLetter,
		matchRating,
		collaborationRating,
		matchSolved,
		collaborationSolved,
		totalSolved,

		// Session history
		sessionHistory,
		matchHistory,
		collaborationHistory,

		// Statistics
		statistics,

		// Leaderboards
		leaderboards,

		// UI state
		loading,
		activeTab,
		setActiveTab,

		// Navigation
		navigateToMatchSummary,
		navigateToCollaborationSummary,
	};
};
