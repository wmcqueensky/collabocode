import { Users, Clock, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

type NavbarProps = {
	time: string;
	handleRun: () => void;
	handleSubmit: () => void;
	activePanel?: string;
	setActivePanel?: (panel: any) => void;
	isMobileMenuOpen?: boolean;
	setIsMobileMenuOpen?: (open: boolean) => void;
	problemTitle?: string;
	participantCount?: number;
	maxParticipants?: number;
};

export const Navbar = ({
	time,
	handleRun,
	handleSubmit,
	isMobileMenuOpen,
	problemTitle = "Problem",
	participantCount = 0,
	maxParticipants = 4,
}: NavbarProps) => {
	return (
		<div className="flex justify-between items-center px-2 sm:px-4 py-2 bg-[#2c2c2c] border-b border-gray-700">
			<div className="flex items-center space-x-2 sm:space-x-4">
				<Link
					to="/"
					className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
				>
					<h1 className="font-bold text-lg sm:text-xl text-[#5bc6ca] flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-5 h-5 sm:w-7 sm:h-7 text-white mr-1"
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
				<div className="hidden sm:flex items-center space-x-2 text-sm">
					<span className="font-medium text-gray-200 truncate max-w-xs">
						{problemTitle}
					</span>
				</div>
			</div>

			<div className="flex items-center space-x-2 sm:space-x-4">
				{/* Stats (hidden on mobile) */}
				<div className="hidden sm:flex items-center space-x-1 text-gray-300">
					<Users className="w-4 h-4 sm:w-5 sm:h-5" />
					<span className="text-xs sm:text-sm">
						{participantCount}/{maxParticipants}
					</span>
				</div>

				{/* Timer */}
				<div className="flex items-center space-x-1 text-gray-300">
					<Clock size={14} />
					<span className="text-xs sm:text-sm font-mono">{time}</span>
				</div>

				{/* Action buttons */}
				<div className="flex items-center space-x-1 sm:space-x-2">
					<button
						className="bg-[#5bc6ca] hover:bg-[#48aeb3] text-black font-medium px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition"
						onClick={handleSubmit}
					>
						Submit
					</button>
					<button
						className="bg-[#2a5a5c] hover:bg-[#39767a] text-[#5bc6ca] px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1 transition"
						onClick={handleRun}
					>
						<PlayCircle size={12} />
						<span>Run</span>
					</button>
				</div>
			</div>

			{/* Mobile menu info (when expanded) */}
			{isMobileMenuOpen && (
				<div className="absolute top-full left-0 right-0 bg-[#2c2c2c] border-b border-gray-700 md:hidden z-50">
					<div className="p-4 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-300 truncate">
								Problem: {problemTitle}
							</span>
							<div className="flex items-center space-x-2 text-sm text-gray-300">
								<Users size={16} />
								<span>
									{participantCount}/{maxParticipants}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
