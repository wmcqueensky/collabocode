import type { SessionParticipant } from "./types";

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
