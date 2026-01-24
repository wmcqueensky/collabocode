import type { StreakModalProps } from "./types";
import {
	getStreakMessage,
	getMotivationMessage,
	generateCalendarDays,
	calculateStats,
} from "./constants";
import { useStreakModal } from "./hooks/useStreakModal";
import { ConfettiParticles } from "./components/ConfettiParticles";
import { StreakHeader } from "./components/StreakHeader";
import { StatsRow } from "./components/StatsRow";
import { ActivityCalendar } from "./components/ActivityCalendar";
import { StreakModalStyles } from "./components/StreakModalStyles";

const StreakModal = ({
	isOpen,
	onClose,
	streak,
	activityHistory = [],
}: StreakModalProps) => {
	const { animateIn, showConfetti, modalRef } = useStreakModal({
		isOpen,
		onClose,
	});

	if (!isOpen) return null;

	const calendarDays = generateCalendarDays(streak, activityHistory);
	const { activeDaysThisMonth, consistencyRate } = calculateStats(calendarDays);

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			{/* Confetti particles */}
			<ConfettiParticles show={showConfetti} streak={streak} />

			<div
				ref={modalRef}
				className={`bg-gradient-to-br from-[#252525] to-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden transform transition-all duration-500 ${
					animateIn ? "scale-100 opacity-100" : "scale-90 opacity-0"
				}`}
			>
				{/* Header */}
				<StreakHeader streak={streak} onClose={onClose} />

				{/* Content */}
				<div className="px-6 py-6">
					<p className="text-gray-300 text-center mb-6">
						{getStreakMessage(streak)}
					</p>

					{/* Stats Row */}
					<StatsRow
						streak={streak}
						activeDaysThisMonth={activeDaysThisMonth}
						consistencyRate={consistencyRate}
					/>

					{/* Activity Calendar */}
					<ActivityCalendar calendarDays={calendarDays} />

					{/* Motivation message */}
					<div className="mt-4 text-center">
						<p className="text-sm text-gray-500">
							{getMotivationMessage(streak)}
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

			<StreakModalStyles />
		</div>
	);
};

export default StreakModal;
