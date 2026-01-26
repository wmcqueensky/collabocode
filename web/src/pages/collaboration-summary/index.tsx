import { Rocket } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

// Hooks
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useCollaborationSummary } from "./hooks/useCollaborationSummary";

// Components
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

	// Current user hook
	const { currentUserId } = useCurrentUser();

	// Main collaboration summary hook
	const {
		loading,
		error,
		session,
		teamMembers,
		teamEvaluation,
		sharedCode,
		historicalStats,
		distributionData,
	} = useCollaborationSummary({ sessionId });

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
		<div className="min-h-screen bg-gray-50 text-gray-700">
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
