import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, Flame, Trophy, Target } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import { supabase } from "../../../../lib/supabase";
import LoginModal from "./modals/login/LoginModal";
import RegisterModal from "./modals/register/RegisterModal";
import NotificationCenter from "../../../../components/notifications/NotificationCenter";

interface UserStats {
	rating: number;
	problems_solved: number;
	streak: number;
}

const Navbar = () => {
	const { user, signOut, loading } = useAuth();
	const location = useLocation();
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showRegisterModal, setShowRegisterModal] = useState(false);
	const [userStats, setUserStats] = useState<UserStats>({
		rating: 1500,
		problems_solved: 0,
		streak: 0,
	});

	useEffect(() => {
		if (user) {
			fetchUserStats();

			// Subscribe to profile changes
			const channel = supabase
				.channel("profile-changes")
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "profiles",
						filter: `id=eq.${user.id}`,
					},
					() => {
						fetchUserStats();
					}
				)
				.subscribe();

			return () => {
				supabase.removeChannel(channel);
			};
		}
	}, [user]);

	const fetchUserStats = async () => {
		if (!user) return;

		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("rating, problems_solved")
				.eq("id", user.id)
				.single();

			if (error) throw error;

			if (data) {
				// Calculate streak from match_history
				const { data: matchData } = await supabase
					.from("match_history")
					.select("created_at, completed")
					.eq("user_id", user.id)
					.eq("completed", true)
					.order("created_at", { ascending: false })
					.limit(30);

				const streak = calculateStreak(matchData || []);

				setUserStats({
					rating: data.rating || 1500,
					problems_solved: data.problems_solved || 0,
					streak,
				});
			}
		} catch (error) {
			console.error("Error fetching user stats:", error);
		}
	};

	const calculateStreak = (matches: any[]) => {
		if (!matches || matches.length === 0) return 0;

		let streak = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 0; i < matches.length; i++) {
			const matchDate = new Date(matches[i].created_at);
			matchDate.setHours(0, 0, 0, 0);

			const expectedDate = new Date(today);
			expectedDate.setDate(today.getDate() - i);

			if (matchDate.getTime() === expectedDate.getTime()) {
				streak++;
			} else {
				break;
			}
		}

		return streak;
	};

	const toggleUserMenu = () => {
		setShowUserMenu(!showUserMenu);
	};

	const handleLogout = async () => {
		await signOut();
		setShowUserMenu(false);
	};

	const switchToRegister = () => {
		setShowLoginModal(false);
		setShowRegisterModal(true);
	};

	const switchToLogin = () => {
		setShowRegisterModal(false);
		setShowLoginModal(true);
	};

	const username =
		user?.user_metadata?.username || user?.email?.split("@")[0] || "User";
	const avatarLetter = username[0]?.toUpperCase() || "U";

	const isActive = (path: string) => location.pathname === path;

	if (loading) {
		return (
			<header className="bg-[#1a1a1a] border-b border-gray-800 py-3 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
					<div className="flex items-center space-x-2">
						<Link to="/" className="flex items-center space-x-2">
							<h1 className="text-2xl font-bold flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-7 h-7 text-white mr-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9.75 6.75L5.25 12l4.5 5.25M14.25 6.75L18.75 12l-4.5 5.25"
									/>
								</svg>
								<span className="text-white">Collabo</span>
								<span className="text-[#5bc6ca]">Code</span>
							</h1>
						</Link>
					</div>
					<div className="flex items-center space-x-4">
						<div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
					</div>
				</div>
			</header>
		);
	}

	return (
		<header className="bg-[#1a1a1a] border-b border-gray-800 py-3 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<Link to="/" className="flex items-center space-x-2">
						<h1 className="text-2xl font-bold flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-7 h-7 text-white mr-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9.75 6.75L5.25 12l4.5 5.25M14.25 6.75L18.75 12l-4.5 5.25"
								/>
							</svg>
							<span className="text-white">Collabo</span>
							<span className="text-[#5bc6ca]">Code</span>
						</h1>
					</Link>
				</div>

				<div className="flex items-center space-x-4">
					{user ? (
						<>
							{/* User Stats - Desktop */}
							<div className="hidden lg:flex items-center space-x-4 mr-2">
								{/* Streak */}
								<div className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700">
									<Flame size={16} className="text-orange-500" />
									<span className="text-sm font-semibold text-white">
										{userStats.streak}
									</span>
									<span className="text-xs text-gray-400">streak</span>
								</div>

								{/* Rating */}
								<div className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700">
									<Trophy size={16} className="text-yellow-500" />
									<span className="text-sm font-semibold text-white">
										{userStats.rating}
									</span>
									<span className="text-xs text-gray-400">ELO</span>
								</div>

								{/* Problems Solved */}
								<div className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700">
									<Target size={16} className="text-[#5bc6ca]" />
									<span className="text-sm font-semibold text-white">
										{userStats.problems_solved}
									</span>
									<span className="text-xs text-gray-400">solved</span>
								</div>
							</div>

							<NotificationCenter />

							{/* User Menu */}
							<div className="relative">
								<button
									onClick={toggleUserMenu}
									className="flex items-center space-x-1 focus:outline-none"
									aria-expanded={showUserMenu}
									aria-haspopup="true"
								>
									<div className="w-8 h-8 rounded-full border border-gray-700 bg-[#5bc6ca] flex items-center justify-center">
										<span className="text-white font-medium text-sm">
											{avatarLetter}
										</span>
									</div>
									<ChevronDown size={16} className="text-gray-400" />
								</button>

								{showUserMenu && (
									<div className="absolute right-0 mt-2 w-72 bg-[#252525] border border-gray-700 rounded-md shadow-lg py-1 z-10">
										{/* User Info Header */}
										<div className="px-4 py-3 border-b border-gray-700">
											<p className="font-medium text-gray-200">{username}</p>
											<p className="text-sm text-gray-400">{user.email}</p>

											{/* Stats - Mobile View */}
											<div className="flex items-center gap-3 mt-3 lg:hidden">
												<div className="flex items-center space-x-1">
													<Flame size={14} className="text-orange-500" />
													<span className="text-xs font-semibold text-white">
														{userStats.streak}
													</span>
												</div>
												<div className="flex items-center space-x-1">
													<Trophy size={14} className="text-yellow-500" />
													<span className="text-xs font-semibold text-white">
														{userStats.rating}
													</span>
												</div>
												<div className="flex items-center space-x-1">
													<Target size={14} className="text-[#5bc6ca]" />
													<span className="text-xs font-semibold text-white">
														{userStats.problems_solved}
													</span>
												</div>
											</div>
										</div>

										{/* Menu Items */}
										<div className="py-1">
											<Link
												to="/profile"
												onClick={() => setShowUserMenu(false)}
												className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
													isActive("/profile")
														? "bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca]"
														: "text-gray-300 hover:bg-gray-700 hover:text-white"
												}`}
											>
												Your Profile
											</Link>
											<Link
												to="/settings"
												onClick={() => setShowUserMenu(false)}
												className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
													isActive("/settings")
														? "bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca]"
														: "text-gray-300 hover:bg-gray-700 hover:text-white"
												}`}
											>
												Settings
											</Link>
										</div>

										{/* Logout */}
										<div className="py-1 border-t border-gray-700">
											<button
												className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
												onClick={handleLogout}
											>
												Sign Out
											</button>
										</div>
									</div>
								)}
							</div>
						</>
					) : (
						<>
							<button
								onClick={() => setShowLoginModal(true)}
								className="hidden sm:block text-gray-300 hover:text-white px-3 py-1 rounded-md text-sm"
							>
								Sign In
							</button>
							<button
								onClick={() => setShowRegisterModal(true)}
								className="bg-[#5bc6ca] hover:bg-[#48aeb3] text-white px-3 py-1 rounded-md text-sm transition-colors"
							>
								Register
							</button>
						</>
					)}

					<button
						onClick={() => setShowMobileMenu(!showMobileMenu)}
						className="md:hidden p-1 rounded-md text-gray-400 hover:text-white focus:outline-none"
					>
						{showMobileMenu ? (
							<X size={24} className="text-gray-300" />
						) : (
							<Menu size={24} className="text-gray-300" />
						)}
					</button>
				</div>
			</div>

			{showMobileMenu && (
				<div className="md:hidden bg-[#1a1a1a] px-4 pt-2 pb-4 border-t border-gray-800">
					<nav className="space-y-1">
						{user ? (
							<>
								<Link
									to="/profile"
									onClick={() => setShowMobileMenu(false)}
									className={`block w-full text-left py-2 ${
										isActive("/profile") ? "text-[#5bc6ca]" : "text-gray-300"
									}`}
								>
									Your Profile
								</Link>
								<Link
									to="/settings"
									onClick={() => setShowMobileMenu(false)}
									className={`block w-full text-left py-2 ${
										isActive("/settings") ? "text-[#5bc6ca]" : "text-gray-300"
									}`}
								>
									Settings
								</Link>
								<button
									className="block w-full text-left py-2 text-gray-300"
									onClick={handleLogout}
								>
									Sign Out
								</button>
							</>
						) : (
							<>
								<button
									onClick={() => {
										setShowLoginModal(true);
										setShowMobileMenu(false);
									}}
									className="block w-full text-left py-2 text-gray-300"
								>
									Sign In
								</button>
								<button
									onClick={() => {
										setShowRegisterModal(true);
										setShowMobileMenu(false);
									}}
									className="block w-full text-left py-2 text-[#5bc6ca]"
								>
									Register
								</button>
							</>
						)}
					</nav>
				</div>
			)}

			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				onSwitchModal={switchToRegister}
			/>

			<RegisterModal
				isOpen={showRegisterModal}
				onClose={() => setShowRegisterModal(false)}
				onSwitchModal={switchToLogin}
			/>
		</header>
	);
};

export default Navbar;
