import { useEffect, useState, useRef } from "react";
import { X, Flame, Sparkles, Calendar, TrendingUp, Zap } from "lucide-react";

interface StreakModalProps {
	isOpen: boolean;
	onClose: () => void;
	streak: number;
	activityHistory?: Date[]; // Optional: dates when user was active
}

const StreakModal = ({
	isOpen,
	onClose,
	streak,
	activityHistory = [],
}: StreakModalProps) => {
	const [animateIn, setAnimateIn] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => setAnimateIn(true), 50);
			setTimeout(() => setShowConfetti(true), 300);
		} else {
			setAnimateIn(false);
			setShowConfetti(false);
		}
	}, [isOpen]);

	// Handle outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const getStreakMessage = () => {
		if (streak === 1) return "Welcome back! Start building your streak.";
		if (streak < 7) return "Great start! Keep the momentum going!";
		if (streak < 14) return "You're building a great habit!";
		if (streak < 30) return "Impressive consistency! You're on fire!";
		if (streak < 100) return "Amazing dedication! Keep pushing!";
		return "LEGENDARY! You're a coding machine!";
	};

	const getStreakEmoji = () => {
		if (streak < 3) return "🔥";
		if (streak < 7) return "⚡";
		if (streak < 14) return "🚀";
		if (streak < 30) return "💎";
		if (streak < 100) return "🏆";
		return "👑";
	};

	// Generate last 28 days (4 weeks) for the activity calendar
	const generateCalendarDays = () => {
		const days = [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 27; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(today.getDate() - i);

			// Check if this date is within the current streak
			const isWithinStreak = i < streak;

			// Check if date is in activity history (if provided)
			const isActive =
				activityHistory.length > 0
					? activityHistory.some((d) => {
							const actDate = new Date(d);
							actDate.setHours(0, 0, 0, 0);
							return actDate.getTime() === date.getTime();
						})
					: isWithinStreak;

			days.push({
				date,
				isActive,
				isToday: i === 0,
				dayOfWeek: date.getDay(),
			});
		}
		return days;
	};

	const calendarDays = generateCalendarDays();
	const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

	// Calculate stats
	const activeDaysThisMonth = calendarDays.filter((d) => d.isActive).length;
	const consistencyRate = Math.round((activeDaysThisMonth / 28) * 100);

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			{/* Confetti particles */}
			{showConfetti && streak > 1 && (
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					{[...Array(15)].map((_, i) => (
						<div
							key={i}
							className="absolute animate-confetti"
							style={{
								left: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 0.5}s`,
								animationDuration: `${2 + Math.random() * 2}s`,
							}}
						>
							<Sparkles
								size={16}
								className={`${
									[
										"text-orange-400",
										"text-yellow-400",
										"text-red-400",
										"text-purple-400",
									][Math.floor(Math.random() * 4)]
								}`}
							/>
						</div>
					))}
				</div>
			)}

			<div
				ref={modalRef}
				className={`bg-gradient-to-br from-[#252525] to-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden transform transition-all duration-500 ${
					animateIn ? "scale-100 opacity-100" : "scale-90 opacity-0"
				}`}
			>
				{/* Header with gradient */}
				<div className="relative bg-gradient-to-r from-orange-600 via-red-500 to-orange-500 px-6 py-8 overflow-hidden">
					{/* Animated background elements */}
					<div className="absolute inset-0 opacity-20">
						<div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
						<div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-300 rounded-full blur-2xl animate-pulse delay-300" />
					</div>

					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
					>
						<X size={20} />
					</button>

					<div className="relative text-center">
						<div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm animate-bounce-slow">
							<Flame size={40} className="text-white drop-shadow-lg" />
						</div>
						<h2 className="text-3xl font-bold text-white mb-1">
							{streak} Day Streak! {getStreakEmoji()}
						</h2>
						<p className="text-white/80 text-sm">Welcome back, coder!</p>
					</div>
				</div>

				{/* Content */}
				<div className="px-6 py-6">
					<p className="text-gray-300 text-center mb-6">{getStreakMessage()}</p>

					{/* Stats Row */}
					<div className="grid grid-cols-3 gap-3 mb-6">
						<div className="bg-[#1a1a1a] rounded-xl p-3 text-center border border-gray-700">
							<Flame size={20} className="mx-auto text-orange-500 mb-1" />
							<p className="text-xl font-bold text-white">{streak}</p>
							<p className="text-xs text-gray-500">Current</p>
						</div>
						<div className="bg-[#1a1a1a] rounded-xl p-3 text-center border border-gray-700">
							<Zap size={20} className="mx-auto text-yellow-500 mb-1" />
							<p className="text-xl font-bold text-white">
								{activeDaysThisMonth}
							</p>
							<p className="text-xs text-gray-500">Active Days</p>
						</div>
						<div className="bg-[#1a1a1a] rounded-xl p-3 text-center border border-gray-700">
							<TrendingUp size={20} className="mx-auto text-green-500 mb-1" />
							<p className="text-xl font-bold text-white">{consistencyRate}%</p>
							<p className="text-xs text-gray-500">Consistency</p>
						</div>
					</div>

					{/* Activity Calendar (Last 4 weeks) */}
					<div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-700">
						<div className="flex items-center gap-2 mb-3">
							<Calendar size={16} className="text-gray-400" />
							<span className="text-sm text-gray-400">Last 4 weeks</span>
						</div>

						{/* Week day headers */}
						<div className="grid grid-cols-7 gap-1 mb-2">
							{weekDays.map((day, index) => (
								<div key={index} className="text-center">
									<span className="text-xs text-gray-600">{day}</span>
								</div>
							))}
						</div>

						{/* Calendar grid */}
						<div className="grid grid-cols-7 gap-1">
							{calendarDays.map((day, index) => (
								<div
									key={index}
									className={`aspect-square rounded-sm flex items-center justify-center transition-all ${
										day.isToday
											? "ring-2 ring-orange-500 ring-offset-1 ring-offset-[#1a1a1a]"
											: ""
									} ${
										day.isActive
											? day.isToday
												? "bg-gradient-to-br from-orange-500 to-red-500"
												: "bg-gradient-to-br from-orange-500/60 to-red-500/60"
											: "bg-gray-800"
									}`}
									title={day.date.toLocaleDateString()}
								>
									{day.isActive && (
										<Flame
											size={10}
											className={day.isToday ? "text-white" : "text-orange-200"}
										/>
									)}
								</div>
							))}
						</div>

						{/* Legend */}
						<div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
							<div className="flex items-center gap-1">
								<div className="w-3 h-3 rounded-sm bg-gray-800" />
								<span>Inactive</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="w-3 h-3 rounded-sm bg-gradient-to-br from-orange-500/60 to-red-500/60" />
								<span>Active</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="w-3 h-3 rounded-sm bg-gradient-to-br from-orange-500 to-red-500 ring-1 ring-orange-500" />
								<span>Today</span>
							</div>
						</div>
					</div>

					{/* Motivation message */}
					<div className="mt-4 text-center">
						<p className="text-sm text-gray-500">
							{streak === 0
								? "Start your streak by completing a match or collaboration today!"
								: streak < 7
									? "Come back tomorrow to keep your streak alive!"
									: "You're doing amazing! Keep up the great work!"}
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 pb-6">
					<button
						onClick={onClose}
						className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/20"
					>
						Keep Coding! 🚀
					</button>
				</div>
			</div>

			<style>{`
				@keyframes confetti {
					0% {
						transform: translateY(-100vh) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(100vh) rotate(720deg);
						opacity: 0;
					}
				}
				.animate-confetti {
					animation: confetti linear forwards;
				}
				@keyframes bounce-slow {
					0%, 100% {
						transform: translateY(0);
					}
					50% {
						transform: translateY(-10px);
					}
				}
				.animate-bounce-slow {
					animation: bounce-slow 2s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
};

export default StreakModal;
