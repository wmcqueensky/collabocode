export interface UserProfile {
	username: string;
	full_name: string;
	match_rating: number;
	collaboration_rating: number;
	match_solved: number;
	collaboration_solved: number;
	rating: number;
	problems_solved: number;
	created_at: string;
}

export interface SessionParticipant {
	username: string;
	user_id: string;
}

export interface SessionHistory {
	id: string;
	session_id: string;
	problem_id: string;
	type: string;
	result: string;
	ranking: number;
	rating_change: number;
	completed: boolean;
	created_at: string;
	problem_title?: string;
	participants?: SessionParticipant[];
}

export interface Statistics {
	totalMatches: number;
	matchWins: number;
	matchLosses: number;
	matchWinRate: number;
	totalCollaborations: number;
	collaborationSuccessRate: number;
	collaborationSuccesses: number;
	averageRanking: number;
}

export interface LeaderboardEntry {
	id: string;
	username: string;
	rating: number;
	solved: number;
	rank: number;
}

export interface Leaderboards {
	match: LeaderboardEntry[];
	collaboration: LeaderboardEntry[];
}

export type ProfileTab = "overview" | "matches" | "collaborations";

export const DEFAULT_STATISTICS: Statistics = {
	totalMatches: 0,
	matchWins: 0,
	matchLosses: 0,
	matchWinRate: 0,
	totalCollaborations: 0,
	collaborationSuccessRate: 0,
	collaborationSuccesses: 0,
	averageRanking: 0,
};

export const DEFAULT_LEADERBOARDS: Leaderboards = {
	match: [],
	collaboration: [],
};
