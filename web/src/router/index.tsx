import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "./layouts/index";
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
		<Route element={<Layout />}>
			<Route index element={<HomePage />} />
			<Route path={MATCH_PATH} element={<MatchPage />} />
			<Route path={COLLABORATION_PATH} element={<CollaborationPage />} />
			<Route path={EXPLORE_PATH} element={<ExplorePage />} />
			<Route path={MATCH_SUMMARY_PATH} element={<MatchSummaryPage />} />
			<Route
				path={COLLABORATION_SUMMARY_PATH}
				element={<CollaborationSummaryPage />}
			/>
		</Route>
		<Route path="*" element={<Navigate to={HOME_PATH} />} />
	</Routes>
);

export default Router;
