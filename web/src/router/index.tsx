import { Navigate, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/main";
import HomeLayout from "./layouts/home";
import HomePage from "../pages/home";
import MatchPage from "../pages/match";
import CollaborationPage from "../pages/collaboration";
import ExplorePage from "../pages/explore";
import MatchSummaryPage from "../pages/match-summary";
import CollaborationSummaryPage from "../pages/collaboration-summary";
import SettingsPage from "../pages/settings";
import ProfilePage from "../pages/profile";
import {
	HOME_PATH,
	EXPLORE_PATH,
	MATCH_PATH,
	COLLABORATION_PATH,
	MATCH_SUMMARY_PATH,
	COLLABORATION_SUMMARY_PATH,
	PROFILE_PATH,
	SETTINGS_PATH,
} from "./paths";

const Router = () => (
	<Routes>
		{/* Home Layout */}
		<Route path={HOME_PATH} element={<HomeLayout />}>
			<Route index element={<HomePage />} />
		</Route>

		{/* Main Layout (with navbar) */}
		<Route element={<MainLayout />}>
			<Route path={EXPLORE_PATH} element={<ExplorePage />} />
			<Route path={SETTINGS_PATH} element={<SettingsPage />} />
			<Route path={PROFILE_PATH} element={<ProfilePage />} />
			<Route
				path={COLLABORATION_SUMMARY_PATH}
				element={<CollaborationSummaryPage />}
			/>
			<Route
				path={`${COLLABORATION_SUMMARY_PATH}/:sessionId`}
				element={<CollaborationSummaryPage />}
			/>
			<Route
				path={`${MATCH_SUMMARY_PATH}/:sessionId`}
				element={<MatchSummaryPage />}
			/>
		</Route>

		{/* Match Pages (full screen, no main layout) */}
		<Route path={`${MATCH_PATH}/:sessionId`} element={<MatchPage />} />
		<Route path={MATCH_PATH} element={<MatchPage />} />

		{/* Collaboration Pages (full screen, no main layout) */}
		<Route
			path={`${COLLABORATION_PATH}/:sessionId`}
			element={<CollaborationPage />}
		/>
		<Route path={COLLABORATION_PATH} element={<CollaborationPage />} />

		{/* Catch all - redirect to home */}
		<Route path="*" element={<Navigate to={HOME_PATH} />} />
	</Routes>
);

export default Router;
