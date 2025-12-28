import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	ChevronDown,
	Menu,
	X,
	Flame,
	Trophy,
	Target,
	Users,
} from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import { supabase } from "../../../../lib/supabase";
import { userService } from "../../../../services/userService";
import LoginModal from "./modals/login/LoginModal";
import RegisterModal from "./modals/register/RegisterModal";
import NotificationCenter from "../../../../components/notifications/NotificationCenter";

interface UserStats {
	matchRating: number;
	collaborationRating: number;
	matchSolved: number;
	collaborationSolved: number;
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
		matchRating: 1500,
		collaborationRating: 1500,
		matchSolved: 0,
		collaborationSolved: 0,
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
			const stats = await userService.getUserStats(user.id);
			setUserStats(stats);
		} catch (error) {
			console.error("Error fetching user stats:", error);
		}
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

	// Calculate total solved
	const totalSolved = userStats.matchSolved + userStats.collaborationSolved;

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
							<div className="hidden lg:flex items-center space-x-3 mr-2">
								{/* Streak */}
								<div className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700">
									<Flame size={16} className="text-orange-500" />
									<span className="text-sm font-semibold text-white">
										{userStats.streak}
									</span>
									<span className="text-xs text-gray-400">streak</span>
								</div>

								{/* Match Rating */}
								<div
									className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700"
									title="Match Rating"
								>
									<Trophy size={16} className="text-yellow-500" />
									<span className="text-sm font-semibold text-white">
										{userStats.matchRating}
									</span>
									<span className="text-xs text-gray-400">ELO</span>
								</div>

								{/* Collaboration Rating */}
								<div
									className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700"
									title="Collaboration Rating"
								>
									<Users size={16} className="text-purple-500" />
									<span className="text-sm font-semibold text-white">
										{userStats.collaborationRating}
									</span>
									<span className="text-xs text-gray-400">Collab</span>
								</div>

								{/* Problems Solved */}
								<div
									className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700"
									title={`Match: ${userStats.matchSolved} | Collab: ${userStats.collaborationSolved}`}
								>
									<Target size={16} className="text-[#5bc6ca]" />
									<span className="text-sm font-semibold text-white">
										{totalSolved}
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
									<div className="absolute right-0 mt-2 w-80 bg-[#252525] border border-gray-700 rounded-md shadow-lg py-1 z-10">
										{/* User Info Header */}
										<div className="px-4 py-3 border-b border-gray-700">
											<p className="font-medium text-gray-200">{username}</p>
											<p className="text-sm text-gray-400">{user.email}</p>

											{/* Stats - Mobile View */}
											<div className="grid grid-cols-2 gap-2 mt-3 lg:hidden">
												<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded">
													<Flame size={14} className="text-orange-500" />
													<span className="text-xs font-semibold text-white">
														{userStats.streak}
													</span>
													<span className="text-xs text-gray-500">streak</span>
												</div>
												<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded">
													<Trophy size={14} className="text-yellow-500" />
													<span className="text-xs font-semibold text-white">
														{userStats.matchRating}
													</span>
													<span className="text-xs text-gray-500">Match</span>
												</div>
												<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded">
													<Users size={14} className="text-purple-500" />
													<span className="text-xs font-semibold text-white">
														{userStats.collaborationRating}
													</span>
													<span className="text-xs text-gray-500">Collab</span>
												</div>
												<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded">
													<Target size={14} className="text-[#5bc6ca]" />
													<span className="text-xs font-semibold text-white">
														{totalSolved}
													</span>
													<span className="text-xs text-gray-500">solved</span>
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
