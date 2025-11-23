import { useState, useEffect } from "react";
import {
	Trophy,
	Target,
	Flame,
	Calendar,
	TrendingUp,
	Award,
	Code,
	Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

interface UserProfile {
	username: string;
	full_name: string;
	rating: number;
	problems_solved: number;
	created_at: string;
}

interface MatchHistory {
	id: string;
	problem_id: string;
	result: string;
	ranking: number;
	rating_change: number;
	completed: boolean;
	created_at: string;
	problem_title?: string;
}

interface Statistics {
	totalMatches: number;
	wins: number;
	losses: number;
	winRate: number;
	averageRanking: number;
	currentStreak: number;
	longestStreak: number;
	ratingChange: number;
}

const ProfilePage = () => {
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
	const [statistics, setStatistics] = useState<Statistics>({
		totalMatches: 0,
		wins: 0,
		losses: 0,
		winRate: 0,
		averageRanking: 0,
		currentStreak: 0,
		longestStreak: 0,
		ratingChange: 0,
	});
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"overview" | "history">(
		"overview"
	);

	useEffect(() => {
		if (user) {
			loadProfile();
			loadMatchHistory();
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

	const loadMatchHistory = async () => {
		if (!user) return;

		setLoading(true);
		try {
			// Get match history
			const { data: matches, error } = await supabase
				.from("match_history")
				.select(
					`
					*,
					problems (
						title
					)
				`
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })
				.limit(20);

			if (error) throw error;

			// Process match data
			const processedMatches = matches?.map((match: any) => ({
				...match,
				problem_title: match.problems?.title || "Unknown Problem",
			}));

			setMatchHistory(processedMatches || []);

			// Calculate statistics
			if (matches && matches.length > 0) {
				const completedMatches = matches.filter((m: any) => m.completed);
				const wins = completedMatches.filter(
					(m: any) => m.ranking === 1
				).length;
				const totalMatches = completedMatches.length;

				// Calculate streaks
				const { currentStreak, longestStreak } = calculateStreaks(matches);

				// Calculate average ranking
				const avgRanking =
					completedMatches.reduce(
						(sum: any, m: any) => sum + (m.ranking || 0),
						0
					) / (completedMatches.length || 1);

				// Calculate total rating change
				const ratingChange = matches.reduce(
					(sum: any, m: any) => sum + (m.rating_change || 0),
					0
				);

				setStatistics({
					totalMatches,
					wins,
					losses: totalMatches - wins,
					winRate: totalMatches > 0 ? (wins / totalMatches) * 100 : 0,
					averageRanking: avgRanking,
					currentStreak,
					longestStreak,
					ratingChange,
				});
			}
		} catch (error) {
			console.error("Error loading match history:", error);
		} finally {
			setLoading(false);
		}
	};

	const calculateStreaks = (matches: any[]) => {
		if (!matches || matches.length === 0)
			return { currentStreak: 0, longestStreak: 0 };

		const completedMatches = matches
			.filter((m) => m.completed)
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);

		let currentStreak = 0;
		let longestStreak = 0;
		let tempStreak = 0;

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Calculate current streak
		for (let i = 0; i < completedMatches.length; i++) {
			const matchDate = new Date(completedMatches[i].created_at);
			matchDate.setHours(0, 0, 0, 0);

			const expectedDate = new Date(today);
			expectedDate.setDate(today.getDate() - i);

			if (matchDate.getTime() === expectedDate.getTime()) {
				currentStreak++;
			} else {
				break;
			}
		}

		// Calculate longest streak
		for (let i = 0; i < completedMatches.length; i++) {
			if (i === 0) {
				tempStreak = 1;
			} else {
				const currentDate = new Date(completedMatches[i].created_at);
				currentDate.setHours(0, 0, 0, 0);

				const prevDate = new Date(completedMatches[i - 1].created_at);
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
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getResultBadge = (ranking: number) => {
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

	return (
		<div className="min-h-screen bg-[#0f0f0f] text-white">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Profile Header */}
				<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-6">
					<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
						{/* Avatar */}
						<div className="w-24 h-24 rounded-full bg-[#5bc6ca] flex items-center justify-center text-4xl font-bold">
							{avatarLetter}
						</div>

						{/* User Info */}
						<div className="flex-1">
							<h1 className="text-3xl font-bold mb-1">{username}</h1>
							{profile.full_name && (
								<p className="text-gray-400 mb-2">{profile.full_name}</p>
							)}
							<div className="flex flex-wrap items-center gap-4">
								<div className="flex items-center space-x-2">
									<Trophy
										size={18}
										className={getRatingColor(profile.rating)}
									/>
									<span
										className={`font-semibold ${getRatingColor(
											profile.rating
										)}`}
									>
										{profile.rating}
									</span>
									<span className="text-gray-400 text-sm">
										{getRatingRank(profile.rating)}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Calendar size={18} className="text-gray-400" />
									<span className="text-gray-400 text-sm">
										Joined {formatDate(profile.created_at)}
									</span>
								</div>
							</div>
						</div>

						{/* Settings Button */}
						<Link
							to="/settings"
							className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
						>
							Edit Profile
						</Link>
					</div>
				</div>

				{/* Statistics Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
						<div className="flex items-center space-x-2 mb-2">
							<Target className="text-[#5bc6ca]" size={20} />
							<span className="text-gray-400 text-sm">Problems Solved</span>
						</div>
						<p className="text-2xl font-bold">{profile.problems_solved}</p>
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
							<span className="text-gray-400 text-sm">Win Rate</span>
						</div>
						<p className="text-2xl font-bold">
							{statistics.winRate.toFixed(1)}%
						</p>
					</div>

					<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
						<div className="flex items-center space-x-2 mb-2">
							<TrendingUp
								className={
									statistics.ratingChange >= 0
										? "text-green-500"
										: "text-red-500"
								}
								size={20}
							/>
							<span className="text-gray-400 text-sm">Rating Change</span>
						</div>
						<p
							className={`text-2xl font-bold ${
								statistics.ratingChange >= 0 ? "text-green-500" : "text-red-500"
							}`}
						>
							{statistics.ratingChange >= 0 ? "+" : ""}
							{statistics.ratingChange}
						</p>
					</div>
				</div>

				{/* Detailed Statistics */}
				<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Statistics Overview</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
						<div>
							<p className="text-gray-400 text-sm mb-1">Total Matches</p>
							<p className="text-lg font-semibold">{statistics.totalMatches}</p>
						</div>
						<div>
							<p className="text-gray-400 text-sm mb-1">Wins</p>
							<p className="text-lg font-semibold text-green-500">
								{statistics.wins}
							</p>
						</div>
						<div>
							<p className="text-gray-400 text-sm mb-1">Losses</p>
							<p className="text-lg font-semibold text-red-500">
								{statistics.losses}
							</p>
						</div>
						<div>
							<p className="text-gray-400 text-sm mb-1">Avg. Ranking</p>
							<p className="text-lg font-semibold">
								{statistics.averageRanking.toFixed(1)}
							</p>
						</div>
						<div>
							<p className="text-gray-400 text-sm mb-1">Longest Streak</p>
							<p className="text-lg font-semibold text-orange-500">
								{statistics.longestStreak}
							</p>
						</div>
						<div>
							<p className="text-gray-400 text-sm mb-1">Current Rating</p>
							<p
								className={`text-lg font-semibold ${getRatingColor(
									profile.rating
								)}`}
							>
								{profile.rating}
							</p>
						</div>
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
							onClick={() => setActiveTab("history")}
							className={`flex-1 px-6 py-3 font-medium transition-colors ${
								activeTab === "history"
									? "bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca] border-b-2 border-[#5bc6ca]"
									: "text-gray-400 hover:text-white hover:bg-gray-800"
							}`}
						>
							Match History
						</button>
					</div>

					<div className="p-6">
						{activeTab === "overview" && (
							<div className="space-y-6">
								<div>
									<h3 className="text-lg font-semibold mb-3">
										Performance Overview
									</h3>
									<p className="text-gray-400 mb-4">
										Track your progress and see how you're improving over time.
									</p>

									{/* Quick Stats Cards */}
									<div className="grid md:grid-cols-2 gap-4">
										<div className="bg-[#252525] rounded-lg border border-gray-700 p-4">
											<div className="flex items-center justify-between mb-3">
												<span className="text-gray-400">Best Performance</span>
												<Trophy className="text-yellow-500" size={20} />
											</div>
											<p className="text-2xl font-bold text-green-500">
												{statistics.wins} Wins
											</p>
											<p className="text-sm text-gray-500 mt-1">
												You're doing great! Keep it up.
											</p>
										</div>

										<div className="bg-[#252525] rounded-lg border border-gray-700 p-4">
											<div className="flex items-center justify-between mb-3">
												<span className="text-gray-400">Activity</span>
												<Code className="text-[#5bc6ca]" size={20} />
											</div>
											<p className="text-2xl font-bold">
												{statistics.totalMatches} Matches
											</p>
											<p className="text-sm text-gray-500 mt-1">
												Total competitive matches played
											</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "history" && (
							<div>
								<h3 className="text-lg font-semibold mb-4">Recent Matches</h3>
								{matchHistory.length === 0 ? (
									<div className="text-center py-12">
										<Clock size={48} className="text-gray-600 mx-auto mb-4" />
										<p className="text-gray-400 mb-2">No match history yet</p>
										<p className="text-sm text-gray-500">
											Start competing to see your match history here
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{matchHistory.map((match) => (
											<div
												key={match.id}
												className="bg-[#252525] rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
											>
												<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
													<div className="flex-1">
														<h4 className="font-medium mb-1">
															{match.problem_title}
														</h4>
														<p className="text-sm text-gray-400">
															{formatDate(match.created_at)}
														</p>
													</div>

													<div className="flex items-center gap-4">
														{match.completed && (
															<>
																{getResultBadge(match.ranking)}
																<div
																	className={`text-sm font-medium ${
																		(match.rating_change || 0) >= 0
																			? "text-green-500"
																			: "text-red-500"
																	}`}
																>
																	{(match.rating_change || 0) >= 0 ? "+" : ""}
																	{match.rating_change || 0} ELO
																</div>
															</>
														)}
														{!match.completed && (
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
