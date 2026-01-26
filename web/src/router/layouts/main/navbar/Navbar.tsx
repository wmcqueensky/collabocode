import { Menu, X } from "lucide-react";
import NotificationCenter from "../../../../notifications";
import LoginModal from "./modals/login/LoginModal";
import RegisterModal from "./modals/register/RegisterModal";

// Hooks
import { useNavbar } from "./hooks/useNavbar";

// Components
import { LogoIcon } from "./components/LogoIcon";
import { NavbarLoading } from "./components/NavbarLoading";
import { UserStatsDisplay } from "./components/UserStatsDisplay";
import { UserMenu } from "./components/UserMenu";
import { MobileMenu } from "./components/MobileMenu";
import { AuthButtons } from "./components/AuthButtons";

const Navbar = () => {
	const {
		// Auth state
		user,
		loading,
		username,
		avatarLetter,

		// UI state
		showMobileMenu,
		showUserMenu,
		activeModal,

		// Stats
		statsLoading,
		userStats,
		totalSolved,

		// Notification
		notificationCloseSignal,

		// Modal actions
		openModal,
		closeModal,
		switchToLogin,
		switchToRegister,

		// Menu actions
		toggleUserMenu,
		closeUserMenu,
		toggleMobileMenu,
		closeMobileMenu,

		// Other actions
		handleLogout,
		handleLogoClick,
		isActive,
	} = useNavbar();

	if (loading) {
		return <NavbarLoading onLogoClick={handleLogoClick} />;
	}

	return (
		<header className="bg-white border-b border-gray-200 py-3 sticky top-0 z-50 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
				{/* Logo */}
				<div className="flex items-center space-x-2">
					<button
						onClick={handleLogoClick}
						className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
					>
						<h1 className="text-2xl font-bold flex items-center">
							<LogoIcon />
							<span className="text-gray-900">Collabo</span>
							<span className="text-sky-600">Code</span>
						</h1>
					</button>
				</div>

				{/* Right Side */}
				<div className="flex items-center space-x-4">
					{user ? (
						<>
							{/* User Stats - Desktop */}
							<UserStatsDisplay
								statsLoading={statsLoading}
								userStats={userStats}
								totalSolved={totalSolved}
							/>

							{/* Notifications */}
							<NotificationCenter
								onOpenChange={() => {}}
								closeSignal={notificationCloseSignal.current}
							/>

							{/* User Menu */}
							<UserMenu
								user={user}
								username={username}
								avatarLetter={avatarLetter}
								showUserMenu={showUserMenu}
								statsLoading={statsLoading}
								userStats={userStats}
								totalSolved={totalSolved}
								onToggleMenu={toggleUserMenu}
								onCloseMenu={closeUserMenu}
								onLogout={handleLogout}
								isActive={isActive}
							/>
						</>
					) : (
						<AuthButtons onOpenModal={openModal} />
					)}

					{/* Mobile Menu Toggle */}
					<button
						onClick={toggleMobileMenu}
						className="md:hidden p-1 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
					>
						{showMobileMenu ? (
							<X size={24} className="text-gray-600" />
						) : (
							<Menu size={24} className="text-gray-600" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			<MobileMenu
				user={user}
				showMobileMenu={showMobileMenu}
				onCloseMenu={closeMobileMenu}
				onLogout={handleLogout}
				onOpenModal={openModal}
				isActive={isActive}
			/>

			{/* Modals */}
			<LoginModal
				isOpen={activeModal === "login"}
				onClose={closeModal}
				onSwitchModal={switchToRegister}
			/>

			<RegisterModal
				isOpen={activeModal === "register"}
				onClose={closeModal}
				onSwitchModal={switchToLogin}
			/>
		</header>
	);
};

export default Navbar;
