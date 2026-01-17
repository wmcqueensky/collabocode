import { useState, useEffect } from "react";
import {
	Trophy,
	Target,
	Flame,
	Calendar,
	Award,
	Users,
	CheckCircle,
	ExternalLink,
	Medal,
	Crown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

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

interface SessionParticipant {
	username: string;
	user_id: string;
}

interface SessionHistory {
	id: string;
	session_id: string;
	problem_id: string;
	type: string;
	result: string;
	ranking: number;
	rating_change: number;
	completed: boolean;
	created_at: string;
	problem_title?: string;
	participants?: SessionParticipant[];
}

interface Statistics {
	totalMatches: number;
	matchWins: number;
	matchLosses: number;
	matchWinRate: number;
	totalCollaborations: number;
	collaborationSuccessRate: number;
	collaborationSuccesses: number;
	averageRanking: number;
	currentStreak: number;
	longestStreak: number;
}

interface LeaderboardEntry {
	id: string;
	username: string;
	rating: number;
	solved: number;
	rank: number;
}

interface Leaderboards {
	match: LeaderboardEntry[];
	collaboration: LeaderboardEntry[];
}

const ProfilePage = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
	const [statistics, setStatistics] = useState<Statistics>({
		totalMatches: 0,
		matchWins: 0,
		matchLosses: 0,
		matchWinRate: 0,
		totalCollaborations: 0,
		collaborationSuccessRate: 0,
		collaborationSuccesses: 0,
		averageRanking: 0,
		currentStreak: 0,
		longestStreak: 0,
	});
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<
		"overview" | "matches" | "collaborations"
	>("overview");
	const [leaderboards, setLeaderboards] = useState<Leaderboards>({
		match: [],
		collaboration: [],
	});

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
					const participantsBySession = new Map<string, SessionParticipant[]>();

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

				// Count all matches (both completed and not completed are valid game results)
				// A match is a "win" if ranking === 1, otherwise it's a loss
				const matchWins = matches.filter((m) => m.ranking === 1).length;
				const matchLosses = matches.filter((m) => m.ranking > 1).length;
				const totalMatches = matchWins + matchLosses;

				// Calculate collaboration success rate
				// A collaboration is successful if result === 'win' or if it's completed with positive rating change
				const successfulCollaborations = collaborations.filter(
					(c) => c.result === "win" || (c.completed && c.rating_change > 0),
				).length;
				const totalCollaborations = collaborations.length;
				const collaborationSuccessRate =
					totalCollaborations > 0
						? (successfulCollaborations / totalCollaborations) * 100
						: 0;

				// Calculate streaks based on completed sessions
				const { currentStreak, longestStreak } = calculateStreaks(history);

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
					currentStreak,
					longestStreak,
				});
			}
		} catch (error) {
			console.error("Error loading session history:", error);
		} finally {
			setLoading(false);
		}
	};

	const calculateStreaks = (history: SessionHistory[]) => {
		if (!history || history.length === 0)
			return { currentStreak: 0, longestStreak: 0 };
		const completedHistory = history
			.filter((h) => h.completed)
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
					(prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
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
			<Users size={14} className="text-[#a78bfa]" />
		) : (
			<Trophy size={14} className="text-yellow-500" />
		);
	};

	// Get other participants (excluding current user)
	const getOtherParticipants = (participants?: SessionParticipant[]) => {
		if (!participants || participants.length === 0) return [];
		return participants.filter((p) => p.user_id !== user?.id);
	};

	// Format participants display
	const formatParticipants = (participants?: SessionParticipant[]) => {
		const others = getOtherParticipants(participants);
		if (others.length === 0) return "Solo";
		if (others.length === 1) return `with ${others[0].username}`;
		if (others.length === 2)
			return `with ${others[0].username} & ${others[1].username}`;
		return `with ${others[0].username} & ${others.length - 1} others`;
	};

	// Get rank icon/badge for leaderboard
	const getRankDisplay = (rank: number) => {
		if (rank === 1) return <Crown size={16} className="text-yellow-400" />;
		if (rank === 2) return <Medal size={16} className="text-gray-300" />;
		if (rank === 3) return <Medal size={16} className="text-amber-600" />;
		return (
			<span className="text-gray-500 text-sm font-mono w-4 text-center">
				{rank}
			</span>
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
									<Trophy size={18} className="text-yellow-500" />
									<span className="font-semibold text-white">
										{matchRating}
									</span>
									<span className="text-gray-400 text-sm">(Match)</span>
								</div>
								<div className="flex items-center space-x-2">
									<Users size={18} className="text-[#a78bfa]" />
									<span className="font-semibold text-white">
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
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
						<p className="text-xs text-gray-500">
							{statistics.matchWins}W / {statistics.matchLosses}L
						</p>
					</div>
					<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
						<div className="flex items-center space-x-2 mb-2">
							<CheckCircle className="text-[#a78bfa]" size={20} />
							<span className="text-gray-400 text-sm">Collab Success</span>
						</div>
						<p className="text-2xl font-bold">
							{statistics.collaborationSuccessRate.toFixed(1)}%
						</p>
						<p className="text-xs text-gray-500">
							{statistics.collaborationSuccesses} successful
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
							<Users className="text-[#a78bfa]" size={20} />
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
							Collaboration History
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
											<Users className="text-[#a78bfa]" size={20} />
										</div>
										<p className="text-2xl font-bold text-[#a78bfa]">
											{statistics.totalCollaborations} Sessions
										</p>
										<p className="text-sm text-gray-500 mt-1">
											{collaborationSolved} problems solved •{" "}
											{collaborationRating} rating
										</p>
									</div>
								</div>

								{/* Leaderboards Section */}
								<div className="mt-8">
									<h3 className="text-lg font-semibold mb-4 flex items-center">
										<Crown size={20} className="mr-2 text-yellow-500" />
										Leaderboards
									</h3>
									<div className="grid md:grid-cols-2 gap-6">
										{/* Match Leaderboard */}
										<div className="bg-[#252525] rounded-lg border border-gray-700 overflow-hidden">
											<div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-4 py-3 border-b border-gray-700">
												<h4 className="font-semibold flex items-center">
													<Trophy size={16} className="mr-2 text-yellow-500" />
													Match Ranking
												</h4>
											</div>
											<div className="divide-y divide-gray-700">
												{leaderboards.match.length === 0 ? (
													<div className="p-4 text-center text-gray-500 text-sm">
														No data available
													</div>
												) : (
													leaderboards.match.map((entry) => (
														<div
															key={entry.id}
															className={`flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition-colors ${
																entry.id === user?.id ? "bg-yellow-500/5" : ""
															}`}
														>
															<div className="flex items-center space-x-3">
																<div className="w-6 flex justify-center">
																	{getRankDisplay(entry.rank)}
																</div>
																<div className="w-8 h-8 rounded-full bg-[#5bc6ca] flex items-center justify-center text-sm font-medium">
																	{entry.username[0]?.toUpperCase() || "?"}
																</div>
																<span
																	className={`font-medium ${entry.id === user?.id ? "text-yellow-400" : "text-white"}`}
																>
																	{entry.username}
																	{entry.id === user?.id && (
																		<span className="text-xs text-gray-500 ml-1">
																			(you)
																		</span>
																	)}
																</span>
															</div>
															<div className="flex items-center space-x-4">
																<div className="text-right">
																	<p className="font-semibold text-yellow-500">
																		{entry.rating}
																	</p>
																	<p className="text-xs text-gray-500">
																		{entry.solved} solved
																	</p>
																</div>
															</div>
														</div>
													))
												)}
											</div>
										</div>

										{/* Collaboration Leaderboard */}
										<div className="bg-[#252525] rounded-lg border border-gray-700 overflow-hidden">
											<div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-3 border-b border-gray-700">
												<h4 className="font-semibold flex items-center">
													<Users size={16} className="mr-2 text-[#a78bfa]" />
													Collaboration Ranking
												</h4>
											</div>
											<div className="divide-y divide-gray-700">
												{leaderboards.collaboration.length === 0 ? (
													<div className="p-4 text-center text-gray-500 text-sm">
														No data available
													</div>
												) : (
													leaderboards.collaboration.map((entry) => (
														<div
															key={entry.id}
															className={`flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition-colors ${
																entry.id === user?.id ? "bg-purple-500/5" : ""
															}`}
														>
															<div className="flex items-center space-x-3">
																<div className="w-6 flex justify-center">
																	{getRankDisplay(entry.rank)}
																</div>
																<div className="w-8 h-8 rounded-full bg-[#a78bfa] flex items-center justify-center text-sm font-medium">
																	{entry.username[0]?.toUpperCase() || "?"}
																</div>
																<span
																	className={`font-medium ${entry.id === user?.id ? "text-[#a78bfa]" : "text-white"}`}
																>
																	{entry.username}
																	{entry.id === user?.id && (
																		<span className="text-xs text-gray-500 ml-1">
																			(you)
																		</span>
																	)}
																</span>
															</div>
															<div className="flex items-center space-x-4">
																<div className="text-right">
																	<p className="font-semibold text-[#a78bfa]">
																		{entry.rating}
																	</p>
																	<p className="text-xs text-gray-500">
																		{entry.solved} solved
																	</p>
																</div>
															</div>
														</div>
													))
												)}
											</div>
										</div>
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
													onClick={() =>
														navigate(`/match-summary/${session.session_id}`)
													}
													className="bg-[#252525] rounded-lg border border-gray-700 p-4 hover:border-[#5bc6ca] hover:bg-[#2a2a2a] transition-all cursor-pointer"
												>
													<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
														<div className="flex-1">
															<div className="flex items-center space-x-2 mb-1">
																{getTypeIcon(session.type || "match")}
																<h4 className="font-medium">
																	{session.problem_title}
																</h4>
															</div>
															<div className="flex items-center space-x-3 text-sm text-gray-400">
																<span>{formatDate(session.created_at)}</span>
																<span className="text-gray-600">•</span>
																<span className="flex items-center">
																	<Users size={12} className="mr-1" />
																	{formatParticipants(session.participants)}
																</span>
															</div>
														</div>
														<div className="flex items-center gap-4">
															{getResultBadge(
																session.ranking,
																session.type || "match",
															)}
															<div
																className={`text-sm font-medium ${
																	(session.rating_change || 0) >= 0
																		? "text-green-500"
																		: "text-red-500"
																}`}
															>
																{(session.rating_change || 0) >= 0 ? "+" : ""}
																{session.rating_change || 0} ELO
															</div>
															{!session.completed &&
																!session.rating_change &&
																!session.ranking && (
																	<span className="px-2 py-1 bg-gray-500 bg-opacity-10 text-gray-400 rounded-full text-xs font-medium">
																		In Progress
																	</span>
																)}
															<ExternalLink
																size={16}
																className="text-gray-500"
															/>
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
													onClick={() =>
														navigate(
															`/collaboration-summary/${session.session_id}`,
														)
													}
													className="bg-[#252525] rounded-lg border border-gray-700 p-4 hover:border-[#a78bfa] hover:bg-[#2a2a2a] transition-all cursor-pointer"
												>
													<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
														<div className="flex-1">
															<div className="flex items-center space-x-2 mb-1">
																{getTypeIcon("collaboration")}
																<h4 className="font-medium">
																	{session.problem_title}
																</h4>
															</div>
															<div className="flex items-center space-x-3 text-sm text-gray-400">
																<span>{formatDate(session.created_at)}</span>
																<span className="text-gray-600">•</span>
																<span className="flex items-center">
																	<Users
																		size={12}
																		className="mr-1 text-[#a78bfa]"
																	/>
																	{formatParticipants(session.participants)}
																</span>
															</div>
														</div>
														<div className="flex items-center gap-4">
															{session.completed ||
															session.rating_change ||
															session.ranking ? (
																<>
																	{getResultBadge(
																		session.ranking,
																		"collaboration",
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
															<ExternalLink
																size={16}
																className="text-gray-500"
															/>
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
