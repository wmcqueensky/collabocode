// Hooks
import { useProfilePage } from "./hooks/useProfilePage";

// Components
import LoadingState from "./components/LoadingState";
import NotFoundState from "./components/NotFoundState";
import ProfileHeader from "./components/ProfileHeader";
import StatisticsGrid from "./components/StatisticsGrid";
import ProfileTabs from "./components/ProfileTabs";
import OverviewTab from "./components/OverviewTab";
import MatchHistoryTab from "./components/MatchHistoryTab";
import CollaborationHistoryTab from "./components/CollaborationHistoryTab";

const ProfilePage = () => {
	const {
		user,
		profile,
		username,
		avatarLetter,
		matchRating,
		collaborationRating,
		matchSolved,
		collaborationSolved,
		totalSolved,
		matchHistory,
		collaborationHistory,
		statistics,
		leaderboards,
		loading,
		activeTab,
		setActiveTab,
		navigateToMatchSummary,
		navigateToCollaborationSummary,
	} = useProfilePage();

	if (loading) {
		return <LoadingState />;
	}

	if (!profile) {
		return <NotFoundState />;
	}

	return (
		<div className="min-h-screen bg-[#0f0f0f] text-white">
			<div className="max-w-7xl mx-auto px-4 py-8">
				<ProfileHeader
					profile={profile}
					username={username}
					avatarLetter={avatarLetter}
					matchRating={matchRating}
					collaborationRating={collaborationRating}
				/>

				<StatisticsGrid
					statistics={statistics}
					totalSolved={totalSolved}
					matchSolved={matchSolved}
					collaborationSolved={collaborationSolved}
				/>

				{/* Tabs Container */}
				<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
					<ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

					<div className="p-6">
						{activeTab === "overview" && (
							<OverviewTab
								statistics={statistics}
								matchRating={matchRating}
								collaborationRating={collaborationRating}
								collaborationSolved={collaborationSolved}
								leaderboards={leaderboards}
								currentUserId={user?.id}
							/>
						)}

						{activeTab === "matches" && (
							<MatchHistoryTab
								history={matchHistory}
								currentUserId={user?.id}
								onSessionClick={navigateToMatchSummary}
							/>
						)}

						{activeTab === "collaborations" && (
							<CollaborationHistoryTab
								history={collaborationHistory}
								currentUserId={user?.id}
								onSessionClick={navigateToCollaborationSummary}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
