import { useEffect, useState } from "react";
import { X, Flame, Trophy, Sparkles, Calendar } from "lucide-react";

interface StreakModalProps {
	isOpen: boolean;
	onClose: () => void;
	streak: number;
}

const StreakModal = ({ isOpen, onClose, streak }: StreakModalProps) => {
	const [animateIn, setAnimateIn] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => setAnimateIn(true), 50);
			setTimeout(() => setShowConfetti(true), 300);
		} else {
			setAnimateIn(false);
			setShowConfetti(false);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const getStreakMessage = () => {
		if (streak === 1)
			return "You started a new streak! Come back tomorrow to keep it going.";
		if (streak < 7) return "Nice! Keep the momentum going!";
		if (streak < 30) return "You're on fire! Amazing consistency!";
		if (streak < 100) return "Incredible dedication! You're unstoppable!";
		return "LEGENDARY! You're a coding machine!";
	};

	const getStreakEmoji = () => {
		if (streak < 7) return "🔥";
		if (streak < 30) return "⚡";
		if (streak < 100) return "💎";
		return "👑";
	};

	const getMilestoneReward = () => {
		const milestones = [7, 30, 100, 365];
		const nextMilestone = milestones.find((m) => m > streak) || streak + 10;
		const daysUntil = nextMilestone - streak;
		return { nextMilestone, daysUntil };
	};

	const { nextMilestone, daysUntil } = getMilestoneReward();

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			{/* Confetti particles */}
			{showConfetti && (
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					{[...Array(20)].map((_, i) => (
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

					{/* Progress to next milestone */}
					<div className="bg-[#1a1a1a] rounded-xl p-4 mb-6 border border-gray-700">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-400 flex items-center gap-2">
								<Trophy size={16} className="text-yellow-500" />
								Next milestone
							</span>
							<span className="text-sm font-semibold text-[#5bc6ca]">
								{nextMilestone} days
							</span>
						</div>
						<div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
								style={{
									width: `${((streak % nextMilestone) / nextMilestone) * 100}%`,
								}}
							/>
						</div>
						<p className="text-xs text-gray-500 mt-2 text-center">
							{daysUntil} day{daysUntil !== 1 ? "s" : ""} until your next
							reward!
						</p>
					</div>

					{/* Weekly calendar view */}
					<div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-700">
						<div className="flex items-center gap-2 mb-3">
							<Calendar size={16} className="text-gray-400" />
							<span className="text-sm text-gray-400">This week</span>
						</div>
						<div className="flex justify-between gap-1">
							{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
								const today = new Date().getDay();
								const isActive = index <= today && streak >= today - index + 1;
								const isToday = index === today;

								return (
									<div key={index} className="flex flex-col items-center gap-1">
										<span className="text-xs text-gray-500">{day}</span>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
												isToday
													? "bg-gradient-to-br from-orange-500 to-red-500 ring-2 ring-orange-500/50"
													: isActive
													? "bg-gradient-to-br from-orange-500/50 to-red-500/50"
													: "bg-gray-700"
											}`}
										>
											{isActive && (
												<Flame
													size={14}
													className={isToday ? "text-white" : "text-orange-300"}
												/>
											)}
										</div>
									</div>
								);
							})}
						</div>
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
