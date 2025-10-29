import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import LoginModal from "./modals/login/LoginModal";
import RegisterModal from "./modals/register/RegisterModal";

type NavbarProps = {
	initialLoggedInState?: boolean;
};

const Navbar = ({ initialLoggedInState = false }: NavbarProps) => {
	const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedInState);
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showRegisterModal, setShowRegisterModal] = useState(false);

	const user = isLoggedIn
		? {
				name: "Jane Doe",
				avatar: "/api/placeholder/32/32",
		  }
		: null;

	const toggleUserMenu = () => {
		setShowUserMenu(!showUserMenu);
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

	const switchToRegister = () => {
		setShowLoginModal(false);
		setShowRegisterModal(true);
	};

	const switchToLogin = () => {
		setShowRegisterModal(false);
		setShowLoginModal(true);
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

				<div className="flex items-center space-x-4">
					{isLoggedIn ? (
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
									</div>

									<div className="py-1">
										<button
											disabled
											className="w-full text-left px-4 py-2 text-sm text-gray-500 cursor-not-allowed"
										>
											Your Profile
										</button>
										<button
											disabled
											className="w-full text-left px-4 py-2 text-sm text-gray-500 cursor-not-allowed"
										>
											Settings
										</button>
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
						{isLoggedIn ? (
							<>
								<button
									disabled
									className="block w-full text-left py-2 text-gray-500 cursor-not-allowed"
								>
									Your Profile
								</button>
								<button
									disabled
									className="block w-full text-left py-2 text-gray-500 cursor-not-allowed"
								>
									Settings
								</button>
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
				onSubmit={handleLogin}
				onSwitchModal={switchToRegister}
			/>

			<RegisterModal
				isOpen={showRegisterModal}
				onClose={() => setShowRegisterModal(false)}
				onSubmit={handleRegister}
				onSwitchModal={switchToLogin}
			/>
		</header>
	);
};

export default Navbar;
