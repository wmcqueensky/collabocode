// User stats interface
export interface UserStats {
	matchRating: number;
	collaborationRating: number;
	matchSolved: number;
	collaborationSolved: number;
}

// Modal types
export type ModalType = "login" | "register" | null;

// Default user stats
export const DEFAULT_USER_STATS: UserStats = {
	matchRating: 1500,
	collaborationRating: 1500,
	matchSolved: 0,
	collaborationSolved: 0,
};
