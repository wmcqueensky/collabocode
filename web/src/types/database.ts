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
	status: "waiting" | "in_progress" | "completed" | "cancelled";
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
	test_results: any;
	is_correct: boolean;
	ranking: number | null;
	joined_at: string;
	user?: Profile;
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
