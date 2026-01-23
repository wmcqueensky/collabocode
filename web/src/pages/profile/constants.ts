import type { SessionHistory, SessionParticipant } from "./types";

// Profile page accent colors
export const ACCENT = {
	primary: "bg-[#5bc6ca]",
	primaryHover: "hover:bg-[#48aeb3]",
	primaryText: "text-[#5bc6ca]",
	primaryBorder: "border-[#5bc6ca]",
	collaboration: "text-[#a78bfa]",
	collaborationBg: "bg-[#a78bfa]",
} as const;

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

/**
 * Calculate streaks from session history
 */
export const calculateStreaks = (
	history: SessionHistory[],
): { currentStreak: number; longestStreak: number } => {
	if (!history || history.length === 0) {
		return { currentStreak: 0, longestStreak: 0 };
	}

	const completedHistory = history
		.filter((h) => h.completed)
		.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		);

	let currentStreak = 0;
	let longestStreak = 0;
	let tempStreak = 0;

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// Calculate current streak
	for (let i = 0; i < completedHistory.length; i++) {
		const date = new Date(completedHistory[i].created_at);
		date.setHours(0, 0, 0, 0);
		const expectedDate = new Date(today);
		expectedDate.setDate(today.getDate() - i);
		if (date.getTime() === expectedDate.getTime()) {
			currentStreak++;
		} else {
			break;
		}
	}

	// Calculate longest streak
	for (let i = 0; i < completedHistory.length; i++) {
		if (i === 0) {
			tempStreak = 1;
		} else {
			const currentDate = new Date(completedHistory[i].created_at);
			currentDate.setHours(0, 0, 0, 0);
			const prevDate = new Date(completedHistory[i - 1].created_at);
			prevDate.setHours(0, 0, 0, 0);
			const dayDiff = Math.floor(
				(prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
			);
			if (dayDiff === 1) {
				tempStreak++;
			} else {
				longestStreak = Math.max(longestStreak, tempStreak);
				tempStreak = 1;
			}
		}
	}

	longestStreak = Math.max(longestStreak, tempStreak);

	return { currentStreak, longestStreak };
};

/**
 * Get other participants (excluding current user)
 */
export const getOtherParticipants = (
	participants: SessionParticipant[] | undefined,
	currentUserId: string | undefined,
): SessionParticipant[] => {
	if (!participants || participants.length === 0) return [];
	return participants.filter((p) => p.user_id !== currentUserId);
};

/**
 * Format participants display string
 */
export const formatParticipants = (
	participants: SessionParticipant[] | undefined,
	currentUserId: string | undefined,
): string => {
	const others = getOtherParticipants(participants, currentUserId);
	if (others.length === 0) return "Solo";
	if (others.length === 1) return `with ${others[0].username}`;
	if (others.length === 2)
		return `with ${others[0].username} & ${others[1].username}`;
	return `with ${others[0].username} & ${others.length - 1} others`;
};
