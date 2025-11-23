import { Navigate, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/main";
import HomeLayout from "./layouts/home";
import HomePage from "../pages/home";
import MatchPage from "../pages/match";
import CollaborationPage from "../pages/collaboration";
import ExplorePage from "../pages/explore";
import MatchSummaryPage from "../pages/match-summary";
import CollaborationSummaryPage from "../pages/collaboration-summary";
import {
	HOME_PATH,
	EXPLORE_PATH,
	MATCH_PATH,
	COLLABORATION_PATH,
	MATCH_SUMMARY_PATH,
	COLLABORATION_SUMMARY_PATH,
} from "./paths";

const Router = () => (
	<Routes>
		<Route path={HOME_PATH} element={<HomeLayout />}>
			<Route index element={<HomePage />} />
		</Route>

		<Route element={<MainLayout />}>
			<Route path={EXPLORE_PATH} element={<ExplorePage />} />
			<Route
				path={COLLABORATION_SUMMARY_PATH}
				element={<CollaborationSummaryPage />}
			/>
			<Route path={COLLABORATION_PATH} element={<CollaborationPage />} />
		</Route>

		<Route path={`${MATCH_PATH}/:sessionId`} element={<MatchPage />} />
		<Route path={MATCH_PATH} element={<MatchPage />} />
		<Route
			path={`${MATCH_SUMMARY_PATH}/:sessionId`}
			element={<MatchSummaryPage />}
		/>

		<Route path="*" element={<Navigate to={HOME_PATH} />} />
	</Routes>
);

export default Router;
