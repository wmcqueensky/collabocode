import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Flame, ChevronDown, Menu, X } from "lucide-react";

type HeaderProps = {
	currentPage?: string;
	initialLoggedInState?: boolean;
};

const Navbar = ({ currentPage, initialLoggedInState = false }: HeaderProps) => {
	const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedInState);
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showRegisterModal, setShowRegisterModal] = useState(false);

	const user = isLoggedIn
		? {
				name: "Jane Doe",
				avatar: "/api/placeholder/32/32",
				streak: 7,
				notifications: 3,
		  }
		: null;

	const notificationItems = [
		{
			id: 1,
			type: "challenge",
			text: "New weekly challenge available",
			time: "2 hours ago",
			isRead: false,
		},
		{
			id: 2,
			type: "achievement",
			text: 'You earned the "Fast Solver" badge',
			time: "1 day ago",
			isRead: false,
		},
		{
			id: 3,
			type: "social",
			text: "Alex commented on your solution",
			time: "2 days ago",
			isRead: true,
		},
	];

	const toggleUserMenu = () => {
		setShowUserMenu(!showUserMenu);
		if (showNotificationsMenu) setShowNotificationsMenu(false);
	};

	const toggleNotificationsMenu = () => {
		setShowNotificationsMenu(!showNotificationsMenu);
		if (showUserMenu) setShowUserMenu(false);
	};

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoggedIn(true);
		setShowLoginModal(false);
	};

	const handleRegister = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoggedIn(true);
		setShowRegisterModal(false);
	};

	const handleLogout = () => {
		setIsLoggedIn(false);
		setShowUserMenu(false);
	};

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

				<div className="hidden md:flex items-center space-x-8">
					<nav>
						<ul className="flex space-x-6">
							<li>
								<Link
									to="/explore"
									className={
										currentPage === "explore"
											? "text-[#5bc6ca] font-medium"
											: "hover:text-[#5bc6ca] transition text-gray-300"
									}
								>
									Explore
								</Link>
							</li>
							<li>
								<Link
									to="/problems"
									className={
										currentPage === "problems"
											? "text-[#5bc6ca] font-medium"
											: "hover:text-[#5bc6ca] transition text-gray-300"
									}
								>
									Problems
								</Link>
							</li>
							<li>
								<Link
									to="/contests"
									className={
										currentPage === "contests"
											? "text-[#5bc6ca] font-medium"
											: "hover:text-[#5bc6ca] transition text-gray-300"
									}
								>
									Contests
								</Link>
							</li>
							<li>
								<Link
									to="/community"
									className={
										currentPage === "community"
											? "text-[#5bc6ca] font-medium"
											: "hover:text-[#5bc6ca] transition text-gray-300"
									}
								>
									Community
								</Link>
							</li>
						</ul>
					</nav>
				</div>

				<div className="flex items-center space-x-4">
					{isLoggedIn ? (
						<>
							<div className="hidden sm:flex items-center text-sm">
								<Flame size={16} className="text-orange-400 mr-1" />
								<span className="text-orange-300">{user?.streak || 0}</span>
							</div>

							<div className="relative hidden sm:block">
								<button
									onClick={toggleNotificationsMenu}
									className="focus:outline-none"
									aria-expanded={showNotificationsMenu}
									aria-haspopup="true"
								>
									<Bell
										size={20}
										className="text-gray-300 hover:text-[#5bc6ca] cursor-pointer"
									/>
									{(user?.notifications ?? 0) > 0 && (
										<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
											{user?.notifications}
										</span>
									)}
								</button>

								{showNotificationsMenu && (
									<div className="absolute right-0 mt-2 w-80 bg-[#252525] border border-gray-700 rounded-md shadow-lg py-1 z-10">
										<div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
											<h3 className="font-medium text-gray-200">
												Notifications
											</h3>
											<button className="text-sm text-[#5bc6ca]">
												Mark all as read
											</button>
										</div>

										<div className="max-h-80 overflow-y-auto">
											{notificationItems.map((notification) => (
												<div
													key={notification.id}
													className={`px-4 py-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
														notification.isRead ? "opacity-60" : ""
													}`}
												>
													<div className="flex items-start">
														<div
															className={`w-2 h-2 rounded-full mt-2 mr-2 ${
																notification.isRead
																	? "bg-transparent"
																	: "bg-[#5bc6ca]"
															}`}
														></div>
														<div>
															<p className="text-sm text-gray-300">
																{notification.text}
															</p>
															<p className="text-xs text-gray-500 mt-1">
																{notification.time}
															</p>
														</div>
													</div>
												</div>
											))}
										</div>

										<div className="px-4 py-2 border-t border-gray-700">
											<Link
												to="/explore"
												className="block text-sm text-center text-[#5bc6ca] hover:text-[#48aeb3]"
											>
												View all notifications
											</Link>
										</div>
									</div>
								)}
							</div>

							<div className="relative">
								<button
									onClick={toggleUserMenu}
									className="flex items-center space-x-1 focus:outline-none"
									aria-expanded={showUserMenu}
									aria-haspopup="true"
								>
									<img
										src={user?.avatar ?? ""}
										alt="User avatar"
										className="w-8 h-8 rounded-full border border-gray-700"
									/>
									<ChevronDown size={16} className="text-gray-400" />
								</button>

								{showUserMenu && (
									<div className="absolute right-0 mt-2 w-64 bg-[#252525] border border-gray-700 rounded-md shadow-lg py-1 z-10">
										<div className="px-4 py-3 border-b border-gray-700">
											<p className="font-medium text-gray-200">{user?.name}</p>
											<p className="text-sm text-gray-400">user@example.com</p>
											<div className="flex items-center mt-2 text-sm">
												<Flame size={14} className="text-orange-400 mr-1" />
												<span className="text-orange-300">
													{user?.streak || 0} day streak
												</span>
											</div>
										</div>

										<div className="py-1">
											<Link
												to="/profile"
												className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
											>
												Your Profile
											</Link>
											<Link
												to="/submissions"
												className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
											>
												Submissions
											</Link>
											<Link
												to="/statistics"
												className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
											>
												Statistics
											</Link>
										</div>

										<div className="py-1 border-t border-gray-700">
											<Link
												to="/settings"
												className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
											>
												Settings
											</Link>
											<Link
												to="/help"
												className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
											>
												Help
											</Link>
										</div>

										<div className="py-1 border-t border-gray-700">
											<Link
												to="/premium"
												className="block px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700"
											>
												<span className="flex items-center">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-4 w-4 mr-2"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
														/>
													</svg>
													Go Premium
												</span>
											</Link>
										</div>

										<div className="py-1 border-t border-gray-700">
											<button
												className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
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
						<Link
							to="/explore"
							onClick={() => setShowMobileMenu(false)}
							className={`block py-2 ${
								currentPage === "explore" ? "text-[#5bc6ca]" : "text-gray-300"
							}`}
						>
							Explore
						</Link>
						<Link
							to="/problems"
							onClick={() => setShowMobileMenu(false)}
							className={`block py-2 ${
								currentPage === "problems" ? "text-[#5bc6ca]" : "text-gray-300"
							}`}
						>
							Problems
						</Link>
						<Link
							to="/contests"
							onClick={() => setShowMobileMenu(false)}
							className={`block py-2 ${
								currentPage === "contests" ? "text-[#5bc6ca]" : "text-gray-300"
							}`}
						>
							Contests
						</Link>
						<Link
							to="/community"
							onClick={() => setShowMobileMenu(false)}
							className={`block py-2 ${
								currentPage === "community" ? "text-[#5bc6ca]" : "text-gray-300"
							}`}
						>
							Community
						</Link>

						{isLoggedIn && (
							<>
								<div className="border-t border-gray-700 my-2"></div>
								<div className="flex items-center py-2">
									<Flame size={16} className="text-orange-400 mr-2" />
									<span className="text-orange-300">
										Streak: {user?.streak || 0} days
									</span>
								</div>
								<div className="flex items-center py-2">
									<Bell size={16} className="text-gray-300 mr-2" />
									<span className="text-gray-300">
										Notifications: {user?.notifications || 0}
									</span>
								</div>
								<Link
									to="/profile"
									className="block py-2 text-gray-300"
									onClick={() => setShowMobileMenu(false)}
								>
									Your Profile
								</Link>
								<Link
									to="/settings"
									className="block py-2 text-gray-300"
									onClick={() => setShowMobileMenu(false)}
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
						)}

						{!isLoggedIn && (
							<>
								<div className="border-t border-gray-700 my-2"></div>
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

			{showLoginModal && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
					<div className="bg-[#252525] rounded-lg shadow-xl w-full max-w-md">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold text-white">Sign In</h2>
								<button
									onClick={() => setShowLoginModal(false)}
									className="text-gray-400 hover:text-white"
								>
									<X size={20} />
								</button>
							</div>

							<form className="space-y-4">
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-300 mb-1"
									>
										Email
									</label>
									<input
										type="email"
										id="email"
										className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
										placeholder="your@email.com"
									/>
								</div>

								<div>
									<label
										htmlFor="password"
										className="block text-sm font-medium text-gray-300 mb-1"
									>
										Password
									</label>
									<input
										type="password"
										id="password"
										className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<input
											id="remember-me"
											type="checkbox"
											className="h-4 w-4 rounded border-gray-700 text-[#5bc6ca] focus:ring-[#5bc6ca]"
										/>
										<label
											htmlFor="remember-me"
											className="ml-2 block text-sm text-gray-300"
										>
											Remember me
										</label>
									</div>

									<div className="text-sm">
										<a href="#" className="text-[#5bc6ca] hover:text-[#48aeb3]">
											Forgot password?
										</a>
									</div>
								</div>

								<button
									type="submit"
									className="w-full bg-[#5bc6ca] hover:bg-[#48aeb3] text-white py-2 px-4 rounded-md transition-colors"
									onClick={handleLogin}
								>
									Sign In
								</button>

								<div className="text-center text-sm text-gray-400">
									Don't have an account?{" "}
									<button
										className="text-[#5bc6ca] hover:text-[#48aeb3]"
										onClick={() => {
											setShowLoginModal(false);
											setShowRegisterModal(true);
										}}
									>
										Register now
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{showRegisterModal && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
					<div className="bg-[#252525] rounded-lg shadow-xl w-full max-w-md">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold text-white">
									Create Account
								</h2>
								<button
									onClick={() => setShowRegisterModal(false)}
									className="text-gray-400 hover:text-white"
								>
									<X size={20} />
								</button>
							</div>

							<form className="space-y-4">
								<div>
									<label
										htmlFor="username"
										className="block text-sm font-medium text-gray-300 mb-1"
									>
										Username
									</label>
									<input
										type="text"
										id="username"
										className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
									/>
								</div>

								<div>
									<label
										htmlFor="register-email"
										className="block text-sm font-medium text-gray-300 mb-1"
									>
										Email
									</label>
									<input
										type="email"
										id="register-email"
										className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
										placeholder="your@email.com"
									/>
								</div>

								<div>
									<label
										htmlFor="register-password"
										className="block text-sm font-medium text-gray-300 mb-1"
									>
										Password
									</label>
									<input
										type="password"
										id="register-password"
										className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
									/>
								</div>

								<div>
									<label
										htmlFor="confirm-password"
										className="block text-sm font-medium text-gray-300 mb-1"
									>
										Confirm Password
									</label>
									<input
										type="password"
										id="confirm-password"
										className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
									/>
								</div>

								<div className="flex items-center">
									<input
										id="agree-terms"
										type="checkbox"
										className="h-4 w-4 rounded border-gray-700 text-[#5bc6ca] focus:ring-[#5bc6ca]"
									/>
									<label
										htmlFor="agree-terms"
										className="ml-2 block text-sm text-gray-300"
									>
										I agree to the{" "}
										<a href="#" className="text-[#5bc6ca]">
											Terms
										</a>{" "}
										and{" "}
										<a href="#" className="text-[#5bc6ca]">
											Privacy Policy
										</a>
									</label>
								</div>

								<button
									type="submit"
									className="w-full bg-[#5bc6ca] hover:bg-[#48aeb3] text-white py-2 px-4 rounded-md transition-colors"
									onClick={handleRegister}
								>
									Create Account
								</button>

								<div className="text-center text-sm text-gray-400">
									Already have an account?{" "}
									<button
										className="text-[#5bc6ca] hover:text-[#48aeb3]"
										onClick={() => {
											setShowRegisterModal(false);
											setShowLoginModal(true);
										}}
									>
										Sign in
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</header>
	);
};

export default Navbar;
