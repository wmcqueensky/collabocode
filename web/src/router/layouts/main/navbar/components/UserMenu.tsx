import { Link } from "react-router-dom";
import { ChevronDown, Trophy, Target, Users } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { UserStats } from "../types";

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
				<div className="w-8 h-8 rounded-full border border-gray-300 bg-sky-600 flex items-center justify-center">
					<span className="text-white font-medium text-sm">{avatarLetter}</span>
				</div>
				<ChevronDown size={16} className="text-gray-500" />
			</button>

			{showUserMenu && (
				<div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
					{/* User Info Header */}
					<div className="px-4 py-3 border-b border-gray-200">
						<p className="font-medium text-gray-900">{username}</p>
						<p className="text-sm text-gray-500">{user.email}</p>

						{/* Stats - Mobile View */}
						<div className="grid grid-cols-2 gap-2 mt-3 lg:hidden">
							{statsLoading ? (
								<>
									<div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded animate-pulse">
										<div className="h-3 w-12 bg-gray-200 rounded"></div>
									</div>
									<div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded animate-pulse">
										<div className="h-3 w-12 bg-gray-200 rounded"></div>
									</div>
									<div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded animate-pulse">
										<div className="h-3 w-12 bg-gray-200 rounded"></div>
									</div>
									<div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded animate-pulse">
										<div className="h-3 w-12 bg-gray-200 rounded"></div>
									</div>
								</>
							) : (
								<>
									<div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded">
										<Trophy size={14} className="text-yellow-500" />
										<span className="text-xs font-semibold text-gray-900">
											{userStats.matchRating}
										</span>
										<span className="text-xs text-gray-500">Match</span>
									</div>
									<div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded">
										<Users size={14} className="text-purple-500" />
										<span className="text-xs font-semibold text-gray-900">
											{userStats.collaborationRating}
										</span>
										<span className="text-xs text-gray-500">Collab</span>
									</div>
									<div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded">
										<Target size={14} className="text-sky-600" />
										<span className="text-xs font-semibold text-gray-900">
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
									? "bg-sky-50 text-sky-600"
									: "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
							}`}
						>
							Your Profile
						</Link>
					</div>

					{/* Logout */}
					<div className="py-1 border-t border-gray-200">
						<button
							className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
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
