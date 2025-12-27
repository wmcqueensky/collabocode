export interface Profile {
	id: string;
	username: string;
	full_name: string | null;
	avatar_url: string | null;
	rating: number;
	problems_solved: number;
	created_at: string;
	updated_at: string;
}

export interface Problem {
	id: string;
	title: string;
	description: string;
	difficulty: "Easy" | "Medium" | "Hard";
	tags: string[];
	rating: number;
	default_time_limit: number;
	starter_code: Record<string, string>;
	test_cases: TestCase[];
	created_at: string;
	is_active: boolean;
}

export interface TestCase {
	input: Record<string, any>;
	output: any;
}

export interface Session {
	id: string;
	problem_id: string;
	host_id: string;
	language: string;
	time_limit: number;
	max_players: number;
	// Added 'completing' status for atomic finalization
	status: "waiting" | "in_progress" | "completing" | "completed" | "cancelled";
	started_at: string | null;
	ended_at: string | null;
	created_at: string;
	problem?: Problem;
	host?: Profile;
}

export interface SessionParticipant {
	id: string;
	session_id: string;
	user_id: string;
	status: "invited" | "declined" | "left" | "joined" | "active";
	code_snapshot: string | null;
	submission_time: string | null;
	test_results: TestResults | null;
	is_correct: boolean;
	ranking: number | null;
	joined_at: string;
	user?: Profile;
}

export interface TestResults {
	allPassed: boolean;
	passedCount: number;
	totalCount: number;
	results: boolean[];
}

export interface MatchHistory {
	id: string;
	user_id: string;
	session_id: string;
	problem_id: string;
	result: "win" | "loss" | "draw";
	ranking: number | null;
	rating_change: number | null;
	completed: boolean;
	created_at: string;
}

export interface MatchSummaryNotification {
	id: string;
	user_id: string;
	session_id: string;
	type: string;
	created_at: string;
	read: boolean;
}

// Code complexity analysis types
export interface ComplexityResult {
	timeComplexity: string;
	spaceComplexity: string;
	confidence: "high" | "medium" | "low" | "none";
	reason?: string;
}

// Match summary types for the summary page
export interface MatchSummaryPlayer {
	name: string;
	avatar: string | null;
	rank: number;
	timeToSolve: number;
	formattedTime: string;
	timeComplexity: string;
	spaceComplexity: string;
	complexityConfidence?: string;
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
	difficulty: string;
	totalParticipants: number;
	winner: string;
	winnerTime: string;
	problemDescription: string;
	players: MatchSummaryPlayer[];
	session: Session;
}
