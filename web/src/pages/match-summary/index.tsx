import { useParams, useNavigate } from "react-router-dom";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useMatchSummary } from "./hooks/useMatchSummary";

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

	useCurrentUser();
	const { loading, error, summaryData, distributionData } =
		useMatchSummary(sessionId);

	if (!sessionId) {
		navigate("/explore");
		return null;
	}

	if (loading) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState error={error} />;
	}

	if (!summaryData) {
		return <NotFoundState />;
	}

	return (
		<div className="min-h-screen bg-gray-50 text-gray-700">
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
