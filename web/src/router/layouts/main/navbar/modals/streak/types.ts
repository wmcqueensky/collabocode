// Streak modal props
export interface StreakModalProps {
	isOpen: boolean;
	onClose: () => void;
	streak: number;
	activityHistory?: Date[];
}

// Calendar day type
export interface CalendarDay {
	date: Date;
	isActive: boolean;
	isToday: boolean;
	dayOfWeek: number;
}

// Stats display props
export interface StatsRowProps {
	streak: number;
	activeDaysThisMonth: number;
	consistencyRate: number;
}

// Activity calendar props
export interface ActivityCalendarProps {
	calendarDays: CalendarDay[];
}

// Streak header props
export interface StreakHeaderProps {
	streak: number;
	onClose: () => void;
}

// Confetti particles props
export interface ConfettiParticlesProps {
	show: boolean;
	streak: number;
}
