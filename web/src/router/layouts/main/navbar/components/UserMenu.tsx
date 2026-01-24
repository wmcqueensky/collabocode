import { Link } from "react-router-dom";
import { ChevronDown, Flame, Trophy, Target, Users } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { UserStats, ModalType } from "../types";

interface UserMenuProps {
	user: User;
	username: string;
	avatarLetter: string;
	showUserMenu: boolean;
	statsLoading: boolean;
	userStats: UserStats;
	totalSolved: number;
	onToggleMenu: () => void;
	onCloseMenu: () => void;
	onLogout: () => void;
	onOpenModal: (modal: ModalType) => void;
	isActive: (path: string) => boolean;
}

export const UserMenu = ({
	user,
	username,
	avatarLetter,
	showUserMenu,
	statsLoading,
	userStats,
	totalSolved,
	onToggleMenu,
	onCloseMenu,
	onLogout,
	onOpenModal,
	isActive,
}: UserMenuProps) => {
	return (
		<div className="relative" data-user-menu>
			<button
				onClick={onToggleMenu}
				className="flex items-center space-x-1 focus:outline-none"
				aria-expanded={showUserMenu}
				aria-haspopup="true"
			>
				<div className="w-8 h-8 rounded-full border border-gray-700 bg-[#5bc6ca] flex items-center justify-center">
					<span className="text-white font-medium text-sm">{avatarLetter}</span>
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
							{statsLoading ? (
								<>
									<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded animate-pulse">
										<div className="h-3 w-12 bg-gray-700 rounded"></div>
									</div>
									<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded animate-pulse">
										<div className="h-3 w-12 bg-gray-700 rounded"></div>
									</div>
									<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded animate-pulse">
										<div className="h-3 w-12 bg-gray-700 rounded"></div>
									</div>
									<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded animate-pulse">
										<div className="h-3 w-12 bg-gray-700 rounded"></div>
									</div>
								</>
							) : (
								<>
									<button
										onClick={() => {
											onCloseMenu();
											onOpenModal("streak");
										}}
										className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded hover:bg-[#252525] transition-colors"
									>
										<Flame size={14} className="text-orange-500" />
										<span className="text-xs font-semibold text-white">
											{userStats.streak}
										</span>
										<span className="text-xs text-gray-500">streak</span>
									</button>
									<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded">
										<Trophy size={14} className="text-yellow-500" />
										<span className="text-xs font-semibold text-white">
											{userStats.matchRating}
										</span>
										<span className="text-xs text-gray-500">Match</span>
									</div>
									<div className="flex items-center space-x-1 bg-[#1a1a1a] px-2 py-1 rounded">
										<Users size={14} className="text-[#a78bfa]" />
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
								</>
							)}
						</div>
					</div>

					{/* Menu Items */}
					<div className="py-1">
						<Link
							to="/profile"
							onClick={onCloseMenu}
							className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
								isActive("/profile")
									? "bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca]"
									: "text-gray-300 hover:bg-gray-700 hover:text-white"
							}`}
						>
							Your Profile
						</Link>
					</div>

					{/* Logout */}
					<div className="py-1 border-t border-gray-700">
						<button
							className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
							onClick={onLogout}
						>
							Sign Out
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
