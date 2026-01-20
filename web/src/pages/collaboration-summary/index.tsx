import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { sessionService } from "../../services/sessionService";
import { supabase } from "../../lib/supabase";

import type {
	TeamMember,
	TeamEvaluation,
	HistoricalStats,
	DistributionData,
} from "./utils/types";

import { loadHistoricalStats, loadDistributionData } from "./utils/dataLoaders";
import { calculateTeamEvaluation } from "./utils/evaluationCalculator";

import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import NotFoundState from "./components/NotFoundState";
import Header from "./components/Header";
import ResultBanner from "./components/ResultBanner";
import SolutionAnalysis from "./components/SolutionAnalysis";
import DistributionCharts from "./components/DistributionCharts";
import TeamMembers from "./components/TeamMembers";
import FeedbackSections from "./components/FeedbackSections";
import TeamFeedback from "./components/TeamFeedback";
import CodePreview from "./components/CodePreview";

export default function CollaborationSummaryPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [session, setSession] = useState<any>(null);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [teamEvaluation, setTeamEvaluation] = useState<TeamEvaluation | null>(
		null,
	);
	const [sharedCode, setSharedCode] = useState<string>("");
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [historicalStats, setHistoricalStats] =
		useState<HistoricalStats | null>(null);
	const [distributionData, setDistributionData] =
		useState<DistributionData | null>(null);

	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setCurrentUserId(user.id);
			}
		};
		loadUser();
	}, []);

	useEffect(() => {
		if (!sessionId) {
			navigate("/explore");
			return;
		}
		loadCollaborationSummary();
	}, [sessionId]);

	const loadCollaborationSummary = async () => {
		try {
			setLoading(true);
			setError(null);

			// Load session
			const sessionData = await sessionService.getSessionById(sessionId!);
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
				sessionId!,
				sessionData.problem_id,
				sessionData.max_players,
				sessionData.time_limit,
			);
			setHistoricalStats(stats);

			// Calculate team evaluation with all dynamic data
			const evaluation = await calculateTeamEvaluation(
				sessionId!,
				participants || [],
				sessionData,
				codeSnapshot,
				stats,
			);
			setTeamEvaluation(evaluation);

			// Load distribution data for comparison charts
			const distribution = await loadDistributionData(
				sessionId!,
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
	};

	if (loading) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState error={error} />;
	}

	if (!session || !teamEvaluation) {
		return <NotFoundState />;
	}

	return (
		<div className="min-h-screen bg-[#171717] text-gray-200">
			<Header />

			{/* Main Content */}
			<main className="container mx-auto py-6 px-4 max-w-5xl">
				<ResultBanner
					teamEvaluation={teamEvaluation}
					session={session}
					teamMembersCount={teamMembers.length}
					historicalStats={historicalStats}
				/>

				<SolutionAnalysis teamEvaluation={teamEvaluation} />

				{distributionData && (
					<DistributionCharts
						distributionData={distributionData}
						teamEvaluation={teamEvaluation}
					/>
				)}

				<TeamMembers teamMembers={teamMembers} currentUserId={currentUserId} />

				<FeedbackSections teamEvaluation={teamEvaluation} />

				<TeamFeedback teamEvaluation={teamEvaluation} />

				<CodePreview
					sharedCode={sharedCode}
					language={session.language}
					teamEvaluation={teamEvaluation}
				/>

				{/* Action Button */}
				<div className="text-center mt-8">
					<button
						onClick={() => navigate("/explore")}
						className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition inline-flex items-center"
					>
						<Rocket className="mr-2" size={20} />
						Start Another Collaboration
					</button>
				</div>
			</main>
		</div>
	);
}
