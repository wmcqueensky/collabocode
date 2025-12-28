import { useState, useEffect } from "react";
import {
	Trophy,
	Target,
	Flame,
	Calendar,
	TrendingUp,
	Award,
	Users,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

interface UserProfile {
	username: string;
	full_name: string;
	match_rating: number;
	collaboration_rating: number;
	match_solved: number;
	collaboration_solved: number;
	rating: number;
	problems_solved: number;
	created_at: string;
}

interface SessionHistory {
	id: string;
	problem_id: string;
	type: string;
	result: string;
	ranking: number;
	rating_change: number;
	completed: boolean;
	created_at: string;
	problem_title?: string;
}

interface Statistics {
	totalMatches: number;
	matchWins: number;
	matchLosses: number;
	matchWinRate: number;
	totalCollaborations: number;
	averageRanking: number;
	currentStreak: number;
	longestStreak: number;
	matchRatingChange: number;
	collaborationRatingChange: number;
}

const ProfilePage = () => {
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
	const [statistics, setStatistics] = useState<Statistics>({
		totalMatches: 0,
		matchWins: 0,
		matchLosses: 0,
		matchWinRate: 0,
		totalCollaborations: 0,
		averageRanking: 0,
		currentStreak: 0,
		longestStreak: 0,
		matchRatingChange: 0,
		collaborationRatingChange: 0,
	});
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<
		"overview" | "matches" | "collaborations"
	>("overview");

	useEffect(() => {
		if (user) {
			loadProfile();
			loadSessionHistory();
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

	const loadSessionHistory = async () => {
		if (!user) return;
		setLoading(true);
		try {
			let history: any[] = [];

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

			setSessionHistory(history);

			if (history.length > 0) {
				const matches = history.filter((h) => h.type === "match" || !h.type);
				const collaborations = history.filter(
					(h) => h.type === "collaboration"
				);
				const completedMatches = matches.filter((m) => m.completed);
				const matchWins = completedMatches.filter(
					(m) => m.ranking === 1
				).length;
				const { currentStreak, longestStreak } = calculateStreaks(history);
				const avgRanking =
					completedMatches.reduce((sum, m) => sum + (m.ranking || 0), 0) /
					(completedMatches.length || 1);
				const matchRatingChange = matches.reduce(
					(sum, m) => sum + (m.rating_change || 0),
					0
				);
				const collaborationRatingChange = collaborations.reduce(
					(sum, c) => sum + (c.rating_change || 0),
					0
				);

				setStatistics({
					totalMatches: completedMatches.length,
					matchWins,
					matchLosses: completedMatches.length - matchWins,
					matchWinRate:
						completedMatches.length > 0
							? (matchWins / completedMatches.length) * 100
							: 0,
					totalCollaborations: collaborations.filter((c) => c.completed).length,
					averageRanking: avgRanking,
					currentStreak,
					longestStreak,
					matchRatingChange,
					collaborationRatingChange,
				});
			}
		} catch (error) {
			console.error("Error loading session history:", error);
		} finally {
			setLoading(false);
		}
	};

	const calculateStreaks = (history: any[]) => {
		if (!history || history.length === 0)
			return { currentStreak: 0, longestStreak: 0 };
		const completedHistory = history
			.filter((h) => h.completed)
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);
		let currentStreak = 0;
		let longestStreak = 0;
		let tempStreak = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 0; i < completedHistory.length; i++) {
			const date = new Date(completedHistory[i].created_at);
			date.setHours(0, 0, 0, 0);
			const expectedDate = new Date(today);
			expectedDate.setDate(today.getDate() - i);
			if (date.getTime() === expectedDate.getTime()) {
				currentStreak++;
			} else {
				break;
			}
		}

		for (let i = 0; i < completedHistory.length; i++) {
			if (i === 0) {
				tempStreak = 1;
			} else {
				const currentDate = new Date(completedHistory[i].created_at);
				currentDate.setHours(0, 0, 0, 0);
				const prevDate = new Date(completedHistory[i - 1].created_at);
				prevDate.setHours(0, 0, 0, 0);
				const dayDiff = Math.floor(
					(prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
				);
				if (dayDiff === 1) {
					tempStreak++;
				} else {
					longestStreak = Math.max(longestStreak, tempStreak);
					tempStreak = 1;
				}
			}
		}
		longestStreak = Math.max(longestStreak, tempStreak);
		return { currentStreak, longestStreak };
	};

	const getRatingColor = (rating: number) => {
		if (rating >= 2000) return "text-red-500";
		if (rating >= 1800) return "text-purple-500";
		if (rating >= 1600) return "text-yellow-500";
		if (rating >= 1400) return "text-green-500";
		return "text-gray-400";
	};

	const getRatingRank = (rating: number) => {
		if (rating >= 2000) return "Grandmaster";
		if (rating >= 1800) return "Master";
		if (rating >= 1600) return "Expert";
		if (rating >= 1400) return "Advanced";
		if (rating >= 1200) return "Intermediate";
		return "Beginner";
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getResultBadge = (ranking: number, type: string) => {
		if (type === "collaboration") {
			return (
				<span className="px-2 py-1 bg-purple-500 bg-opacity-10 text-purple-500 rounded-full text-xs font-medium">
					Collaboration
				</span>
			);
		}
		if (ranking === 1)
			return (
				<span className="px-2 py-1 bg-green-500 bg-opacity-10 text-green-500 rounded-full text-xs font-medium">
					1st Place
				</span>
			);
		if (ranking === 2)
			return (
				<span className="px-2 py-1 bg-blue-500 bg-opacity-10 text-blue-500 rounded-full text-xs font-medium">
					2nd Place
				</span>
			);
		if (ranking === 3)
			return (
				<span className="px-2 py-1 bg-orange-500 bg-opacity-10 text-orange-500 rounded-full text-xs font-medium">
					3rd Place
				</span>
			);
		return (
			<span className="px-2 py-1 bg-gray-500 bg-opacity-10 text-gray-400 rounded-full text-xs font-medium">
				{ranking}th Place
			</span>
		);
	};

	const getTypeIcon = (type: string) => {
		return type === "collaboration" ? (
			<Users size={14} className="text-purple-500" />
		) : (
			<Trophy size={14} className="text-yellow-500" />
		);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-[#5bc6ca] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-400">Loading profile...</p>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-400 mb-4">Profile not found</p>
					<Link
						to="/"
						className="px-4 py-2 bg-[#5bc6ca] hover:bg-[#48aeb3] text-white rounded-lg transition-colors"
					>
						Go Home
					</Link>
				</div>
			</div>
		);
	}

	const username = profile.username || user?.email?.split("@")[0] || "User";
	const avatarLetter = username[0]?.toUpperCase() || "U";
	const matchRating = profile.match_rating ?? profile.rating ?? 1500;
	const collaborationRating = profile.collaboration_rating ?? 1500;
	const matchSolved = profile.match_solved ?? profile.problems_solved ?? 0;
	const collaborationSolved = profile.collaboration_solved ?? 0;
	const totalSolved = matchSolved + collaborationSolved;

	return (
		<div className="min-h-screen bg-[#0f0f0f] text-white">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Profile Header */}
				<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-6">
					<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
						<div className="w-24 h-24 rounded-full bg-[#5bc6ca] flex items-center justify-center text-4xl font-bold">
							{avatarLetter}
						</div>
						<div className="flex-1">
							<h1 className="text-3xl font-bold mb-1">{username}</h1>
							{profile.full_name && (
								<p className="text-gray-400 mb-2">{profile.full_name}</p>
							)}
							<div className="flex flex-wrap items-center gap-4">
								<div className="flex items-center space-x-2">
									<Trophy size={18} className={getRatingColor(matchRating)} />
									<span
										className={`font-semibold ${getRatingColor(matchRating)}`}
									>
										{matchRating}
									</span>
									<span className="text-gray-400 text-sm">
										{getRatingRank(matchRating)} (Match)
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Users size={18} className="text-purple-500" />
									<span className="font-semibold text-purple-500">
										{collaborationRating}
									</span>
									<span className="text-gray-400 text-sm">(Collab)</span>
								</div>
								<div className="flex items-center space-x-2">
									<Calendar size={18} className="text-gray-400" />
									<span className="text-gray-400 text-sm">
										Joined {formatDate(profile.created_at)}
									</span>
								</div>
							</div>
						</div>
						<Link
							to="/settings"
							className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
						>
							Edit Profile
						</Link>
					</div>
				</div>

				{/* Statistics Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
					<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
						<div className="flex items-center space-x-2 mb-2">
							<Target className="text-[#5bc6ca]" size={20} />
							<span className="text-gray-400 text-sm">Total Solved</span>
						</div>
						<p className="text-2xl font-bold">{totalSolved}</p>
						<p className="text-xs text-gray-500">
							M: {matchSolved} | C: {collaborationSolved}
						</p>
					</div>
					<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
						<div className="flex items-center space-x-2 mb-2">
							<Flame className="text-orange-500" size={20} />
							<span className="text-gray-400 text-sm">Current Streak</span>
						</div>
						<p className="text-2xl font-bold">{statistics.currentStreak}</p>
					</div>
					<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
						<div className="flex items-center space-x-2 mb-2">
							<Award className="text-yellow-500" size={20} />
							<span className="text-gray-400 text-sm">Match Win Rate</span>
						</div>
						<p className="text-2xl font-bold">
							{statistics.matchWinRate.toFixed(1)}%
						</p>
					</div>
					<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
						<div className="flex items-center space-x-2 mb-2">
							<TrendingUp
								className={
									statistics.matchRatingChange >= 0
										? "text-green-500"
										: "text-red-500"
								}
								size={20}
							/>
							<span className="text-gray-400 text-sm">Match Rating Δ</span>
						</div>
						<p
							className={`text-2xl font-bold ${
								statistics.matchRatingChange >= 0
									? "text-green-500"
									: "text-red-500"
							}`}
						>
							{statistics.matchRatingChange >= 0 ? "+" : ""}
							{statistics.matchRatingChange}
						</p>
					</div>
					<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
						<div className="flex items-center space-x-2 mb-2">
							<Trophy className="text-yellow-500" size={20} />
							<span className="text-gray-400 text-sm">Total Matches</span>
						</div>
						<p className="text-2xl font-bold">{statistics.totalMatches}</p>
					</div>
					<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
						<div className="flex items-center space-x-2 mb-2">
							<Users className="text-purple-500" size={20} />
							<span className="text-gray-400 text-sm">Collaborations</span>
						</div>
						<p className="text-2xl font-bold">
							{statistics.totalCollaborations}
						</p>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
					<div className="flex border-b border-gray-800">
						<button
							onClick={() => setActiveTab("overview")}
							className={`flex-1 px-6 py-3 font-medium transition-colors ${
								activeTab === "overview"
									? "bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca] border-b-2 border-[#5bc6ca]"
									: "text-gray-400 hover:text-white hover:bg-gray-800"
							}`}
						>
							Overview
						</button>
						<button
							onClick={() => setActiveTab("matches")}
							className={`flex-1 px-6 py-3 font-medium transition-colors ${
								activeTab === "matches"
									? "bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca] border-b-2 border-[#5bc6ca]"
									: "text-gray-400 hover:text-white hover:bg-gray-800"
							}`}
						>
							Match History
						</button>
						<button
							onClick={() => setActiveTab("collaborations")}
							className={`flex-1 px-6 py-3 font-medium transition-colors ${
								activeTab === "collaborations"
									? "bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca] border-b-2 border-[#5bc6ca]"
									: "text-gray-400 hover:text-white hover:bg-gray-800"
							}`}
						>
							Collaborations
						</button>
					</div>

					<div className="p-6">
						{activeTab === "overview" && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold mb-3">
									Performance Overview
								</h3>
								<p className="text-gray-400 mb-4">
									Track your progress across both competitive matches and
									collaborative sessions.
								</p>
								<div className="grid md:grid-cols-2 gap-4">
									<div className="bg-[#252525] rounded-lg border border-gray-700 p-4">
										<div className="flex items-center justify-between mb-3">
											<span className="text-gray-400">Match Performance</span>
											<Trophy className="text-yellow-500" size={20} />
										</div>
										<p className="text-2xl font-bold text-green-500">
											{statistics.matchWins} Wins
										</p>
										<p className="text-sm text-gray-500 mt-1">
											{statistics.matchLosses} losses • {matchRating} ELO
										</p>
									</div>
									<div className="bg-[#252525] rounded-lg border border-gray-700 p-4">
										<div className="flex items-center justify-between mb-3">
											<span className="text-gray-400">
												Collaboration Activity
											</span>
											<Users className="text-purple-500" size={20} />
										</div>
										<p className="text-2xl font-bold text-purple-500">
											{statistics.totalCollaborations} Sessions
										</p>
										<p className="text-sm text-gray-500 mt-1">
											{collaborationSolved} problems solved •{" "}
											{collaborationRating} rating
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === "matches" && (
							<div>
								<h3 className="text-lg font-semibold mb-4">Match History</h3>
								{sessionHistory.filter((h) => h.type === "match" || !h.type)
									.length === 0 ? (
									<div className="text-center py-12">
										<Trophy size={48} className="text-gray-600 mx-auto mb-4" />
										<p className="text-gray-400 mb-2">No match history yet</p>
										<p className="text-sm text-gray-500">
											Start competing to see your match history here
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{sessionHistory
											.filter((h) => h.type === "match" || !h.type)
											.map((session) => (
												<div
													key={session.id}
													className="bg-[#252525] rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
												>
													<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
														<div className="flex-1">
															<div className="flex items-center space-x-2 mb-1">
																{getTypeIcon(session.type || "match")}
																<h4 className="font-medium">
																	{session.problem_title}
																</h4>
															</div>
															<p className="text-sm text-gray-400">
																{formatDate(session.created_at)}
															</p>
														</div>
														<div className="flex items-center gap-4">
															{session.completed ? (
																<>
																	{getResultBadge(
																		session.ranking,
																		session.type || "match"
																	)}
																	<div
																		className={`text-sm font-medium ${
																			(session.rating_change || 0) >= 0
																				? "text-green-500"
																				: "text-red-500"
																		}`}
																	>
																		{(session.rating_change || 0) >= 0
																			? "+"
																			: ""}
																		{session.rating_change || 0} ELO
																	</div>
																</>
															) : (
																<span className="px-2 py-1 bg-gray-500 bg-opacity-10 text-gray-400 rounded-full text-xs font-medium">
																	Incomplete
																</span>
															)}
														</div>
													</div>
												</div>
											))}
									</div>
								)}
							</div>
						)}

						{activeTab === "collaborations" && (
							<div>
								<h3 className="text-lg font-semibold mb-4">
									Collaboration History
								</h3>
								{sessionHistory.filter((h) => h.type === "collaboration")
									.length === 0 ? (
									<div className="text-center py-12">
										<Users size={48} className="text-gray-600 mx-auto mb-4" />
										<p className="text-gray-400 mb-2">
											No collaboration history yet
										</p>
										<p className="text-sm text-gray-500">
											Start collaborating to see your history here
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{sessionHistory
											.filter((h) => h.type === "collaboration")
											.map((session) => (
												<div
													key={session.id}
													className="bg-[#252525] rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
												>
													<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
														<div className="flex-1">
															<div className="flex items-center space-x-2 mb-1">
																{getTypeIcon("collaboration")}
																<h4 className="font-medium">
																	{session.problem_title}
																</h4>
															</div>
															<p className="text-sm text-gray-400">
																{formatDate(session.created_at)}
															</p>
														</div>
														<div className="flex items-center gap-4">
															{session.completed ? (
																<>
																	{getResultBadge(
																		session.ranking,
																		"collaboration"
																	)}
																	<div
																		className={`text-sm font-medium ${
																			(session.rating_change || 0) >= 0
																				? "text-green-500"
																				: "text-red-500"
																		}`}
																	>
																		{(session.rating_change || 0) >= 0
																			? "+"
																			: ""}
																		{session.rating_change || 0}
																	</div>
																</>
															) : (
																<span className="px-2 py-1 bg-gray-500 bg-opacity-10 text-gray-400 rounded-full text-xs font-medium">
																	Incomplete
																</span>
															)}
														</div>
													</div>
												</div>
											))}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
