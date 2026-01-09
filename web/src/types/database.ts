// Database types for CollaborCode

export type SessionType = "match" | "collaboration";
export type SessionStatus =
	| "waiting"
	| "in_progress"
	| "completing"
	| "completed"
	| "cancelled";
export type ParticipantStatus = "invited" | "joined" | "declined" | "left";
export type ParticipantRole = "host" | "participant" | "viewer";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type MatchResult = "win" | "loss" | "draw";
export type ActivityType =
	| "passed"
	| "failed"
	| "ran"
	| "modifying"
	| "submitted";

export interface Profile {
	id: string;
	username: string;
	full_name: string | null;
	avatar_url: string | null;
	// Legacy fields (kept for backward compatibility)
	rating: number;
	problems_solved: number;
	// New split fields
	match_rating: number;
	collaboration_rating: number;
	match_solved: number;
	collaboration_solved: number;
	created_at: string;
	updated_at: string;
}

export interface Problem {
	id: string;
	title: string;
	description: string;
	difficulty: Difficulty;
	tags: string[];
	rating: number;
	default_time_limit: number;
	starter_code: Record<string, string>;
	test_cases: TestCase[];
	solution_template: Record<string, string> | null;
	created_at: string;
	created_by: string | null;
	is_active: boolean;
}

export interface TestCase {
	input: Record<string, any>;
	output: any;
}

export interface Session {
	id: string;
	type: SessionType;
	problem_id: string;
	host_id: string;
	language: string;
	time_limit: number;
	max_players: number;
	status: SessionStatus;
	started_at: string | null;
	ended_at: string | null;
	created_at: string;
	// Collaboration-specific fields
	description: string | null;
	is_public: boolean;
	allow_join_in_progress: boolean;
	// Joined data
	problem?: Problem;
	host?: Profile;
}

export interface SessionParticipant {
	id: string;
	session_id: string;
	user_id: string;
	status: ParticipantStatus;
	role: ParticipantRole;
	code_snapshot: string | null;
	submission_time: string | null;
	test_results: TestResults | null;
	is_correct: boolean;
	ranking: number | null;
	joined_at: string;
	// Collaboration-specific fields
	last_active_at: string | null;
	cursor_position: CursorPosition | null;
	// Joined data
	user?: Profile;
}

export interface TestResults {
	results: boolean[];
	allPassed: boolean;
	totalCount: number;
	passedCount: number;
}

export interface CursorPosition {
	line: number;
	column: number;
	selection?: {
		startLine: number;
		startColumn: number;
		endLine: number;
		endColumn: number;
	};
}

export interface SessionHistory {
	id: string;
	user_id: string;
	session_id: string;
	problem_id: string;
	type: SessionType;
	result: MatchResult;
	ranking: number | null;
	rating_change: number | null;
	completed: boolean;
	created_at: string;
}

// Alias for backward compatibility
export type MatchHistory = SessionHistory;

export interface SessionSummaryNotification {
	id: string;
	user_id: string;
	session_id: string;
	session_type: SessionType;
	type: string;
	created_at: string;
	read: boolean;
}

export interface ChatMessage {
	id: string;
	session_id: string;
	user_id: string;
	username: string;
	message: string;
	created_at: string;
}

// NEW: Session Activity for real-time activity feed
export interface SessionActivity {
	id: string;
	session_id: string;
	user_id: string;
	username: string;
	type: ActivityType;
	message: string;
	created_at: string;
}

export interface ComplexityResult {
	timeComplexity: string;
	spaceComplexity: string;
	confidence: "high" | "medium" | "low" | "none";
	reason?: string;
}

export interface MatchSummaryPlayer {
	name: string;
	avatar: string | null;
	rank: number;
	timeToSolve: number;
	formattedTime: string;
	timeComplexity: string;
	spaceComplexity: string;
	complexityConfidence: string;
	passedTestCases: number;
	passedTestCount: number;
	totalTestCount: number;
	codeQualityScore: number;
	submissionTime: string;
	initial: string;
	bgColor: string;
	textColor: string;
	isCorrect: boolean;
	userId: string;
	currentRating: number;
	previousRating: number;
	ratingChange: number;
}

export interface MatchSummary {
	problemName: string;
	difficulty: Difficulty;
	totalParticipants: number;
	winner: string;
	winnerTime: string;
	problemDescription: string;
	players: MatchSummaryPlayer[];
	session: Session;
}

// User statistics interface
export interface UserStats {
	matchRating: number;
	collaborationRating: number;
	matchSolved: number;
	collaborationSolved: number;
	streak: number;
}
