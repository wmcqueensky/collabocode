// User stats interface
export interface UserStats {
	matchRating: number;
	collaborationRating: number;
	matchSolved: number;
	collaborationSolved: number;
	streak: number;
}

// Modal types
export type ModalType = "login" | "register" | "streak" | null;

// Default user stats
export const DEFAULT_USER_STATS: UserStats = {
	matchRating: 1500,
	collaborationRating: 1500,
	matchSolved: 0,
	collaborationSolved: 0,
	streak: 0,
};
