import type { CalendarDay } from "./types";

// Week day labels
export const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Calendar days to show (4 weeks)
export const CALENDAR_DAYS_COUNT = 28;

// Get streak message based on current streak
export const getStreakMessage = (streak: number): string => {
	if (streak === 1) return "Welcome back! Start building your streak.";
	if (streak < 7) return "Great start! Keep the momentum going!";
	if (streak < 14) return "You're building a great habit!";
	if (streak < 30) return "Impressive consistency! You're on fire!";
	if (streak < 100) return "Amazing dedication! Keep pushing!";
	return "LEGENDARY! You're a coding machine!";
};

// Get streak emoji based on current streak
export const getStreakEmoji = (streak: number): string => {
	if (streak < 3) return "🔥";
	if (streak < 7) return "⚡";
	if (streak < 14) return "🚀";
	if (streak < 30) return "💎";
	if (streak < 100) return "🏆";
	return "👑";
};

// Get motivation message based on streak
export const getMotivationMessage = (streak: number): string => {
	if (streak === 0) {
		return "Start your streak by completing a match or collaboration today!";
	}
	if (streak < 7) {
		return "Come back tomorrow to keep your streak alive!";
	}
	return "You're doing amazing! Keep up the great work!";
};

// Generate last 28 days (4 weeks) for the activity calendar
export const generateCalendarDays = (
	streak: number,
	activityHistory: Date[] = [],
): CalendarDay[] => {
	const days: CalendarDay[] = [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	for (let i = CALENDAR_DAYS_COUNT - 1; i >= 0; i--) {
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

// Calculate stats from calendar days
export const calculateStats = (calendarDays: CalendarDay[]) => {
	const activeDaysThisMonth = calendarDays.filter((d) => d.isActive).length;
	const consistencyRate = Math.round(
		(activeDaysThisMonth / CALENDAR_DAYS_COUNT) * 100,
	);
	return { activeDaysThisMonth, consistencyRate };
};

// Confetti colors
export const CONFETTI_COLORS = [
	"text-orange-400",
	"text-yellow-400",
	"text-red-400",
	"text-purple-400",
];

// Get random confetti color
export const getRandomConfettiColor = (): string => {
	return CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
};
