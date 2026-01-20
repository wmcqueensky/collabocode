import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { matchService } from "../../services/matchService";
import { sessionService } from "../../services/sessionService";
import { supabase } from "../../lib/supabase";

import type { DistributionData, SummaryData } from "./utils/types";
import { loadDistributionData } from "./utils/dataLoaders";

import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import NotFoundState from "./components/NotFoundState";
import Header from "./components/Header";
import SuccessBanner from "./components/SuccessBanner";
import Leaderboard from "./components/Leaderboard";
import StatsGrid from "./components/StatsGrid";
import DistributionCharts from "./components/DistributionCharts";
import PerformanceCharts from "./components/PerformanceCharts";
import MetricsLegend from "./components/MetricsLegend";

export default function MatchSummaryPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
	const [accessError, setAccessError] = useState<string | null>(null);
	const [distributionData, setDistributionData] =
		useState<DistributionData | null>(null);
	const [_currentUserId, setCurrentUserId] = useState<string>("");

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

		checkAccessAndLoadSummary();
	}, [sessionId]);

	const checkAccessAndLoadSummary = async () => {
		try {
			setLoading(true);
			setAccessError(null);

			// First, check if session is completed
			const session = await sessionService.getSessionById(sessionId!);

			if (!session) {
				setAccessError("Session not found");
				setLoading(false);
				return;
			}

			// Check if session is completed
			if (session.status !== "completed") {
				setAccessError(
					"This match is still in progress. You'll be notified when all players have submitted their solutions.",
				);
				setLoading(false);
				return;
			}

			// Check if all participants have submitted
			const allSubmitted = await matchService.checkAllSubmitted(sessionId!);

			if (!allSubmitted) {
				setAccessError(
					"Not all players have submitted yet. Please wait for the match to complete.",
				);
				setLoading(false);
				return;
			}

			// Load summary data
			const data = await matchService.getMatchSummary(sessionId!);
			setSummaryData(data);

			// Load distribution data for comparison charts
			const winner = data.players.find((p: any) => p.rank === 1);
			if (winner) {
				const distribution = await loadDistributionData(
					sessionId!,
					session.problem_id,
					winner.timeToSolve,
					winner.timeComplexity,
					winner.spaceComplexity,
					session.language,
				);
				setDistributionData(distribution);
			}
		} catch (error) {
			console.error("Error loading match summary:", error);
			setAccessError("Failed to load match summary");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <LoadingState />;
	}

	if (accessError) {
		return <ErrorState error={accessError} />;
	}

	if (!summaryData) {
		return <NotFoundState />;
	}

	return (
		<div className="min-h-screen bg-[#171717] text-gray-200">
			<Header />

			<main className="container mx-auto py-6 px-4 max-w-5xl">
				<SuccessBanner summaryData={summaryData} />

				<Leaderboard players={summaryData.players} />

				<StatsGrid
					players={summaryData.players}
					winner={summaryData.winner}
					winnerTime={summaryData.winnerTime}
				/>

				{distributionData && (
					<DistributionCharts
						distributionData={distributionData}
						winnerTime={summaryData.winnerTime}
						winnerTimeComplexity={summaryData.players[0]?.timeComplexity}
						winnerSpaceComplexity={summaryData.players[0]?.spaceComplexity}
					/>
				)}

				<PerformanceCharts players={summaryData.players} />

				<MetricsLegend />
			</main>
		</div>
	);
}
