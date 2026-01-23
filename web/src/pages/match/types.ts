import type {
	Session,
	SessionParticipant,
	Problem,
} from "../../types/database";

export interface TestCase {
	input: any;
	output: any;
	result?: string;
	status: "pending" | "pass" | "fail" | "running";
}

export interface Participant {
	id: string;
	name: string;
	progress: number;
	status: "idle" | "typing" | "thinking" | "complete";
	finishPosition: number | null;
	isCorrect: boolean;
}

export interface Activity {
	id: string;
	type: ActivityType;
	message: string;
	timestamp: string;
	userId?: string;
}

export type ActivityType =
	| "passed"
	| "failed"
	| "ran"
	| "modifying"
	| "submitted";

export type ActivePanel = "problem" | "editor" | "chat";

export interface OutputLine {
	message: string;
	status: string;
}

export interface SubmissionResult {
	allPassed: boolean;
	passedCount: number;
	totalCount: number;
}

export interface TestResults {
	passedCount: number;
	totalCount: number;
	results: boolean[];
}

export interface MatchPageState {
	// Timer
	seconds: number;
	timeStr: string;
	timerStarted: boolean;

	// UI
	activeProblemTab: string;
	isChatOpen: boolean;
	isMobileMenuOpen: boolean;
	activePanel: ActivePanel;
	isMicOn: boolean;

	// Code editor
	code: string;
	language: string;

	// Test cases
	testCases: TestCase[];
	output: OutputLine[];

	// Participants
	participants: Participant[];

	// Activities
	activities: Activity[];

	// User
	currentUserId: string;
	currentUsername: string;

	// Session state
	showWaitingLobby: boolean;
	showSubmissionModal: boolean;
	submissionResult: SubmissionResult | null;
	hasSubmitted: boolean;
}

export interface FileData {
	name: string;
	language: string;
	content: string;
}

// Re-export database types for convenience
export type { Session, SessionParticipant, Problem };
