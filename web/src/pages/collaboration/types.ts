import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import type { Session, SessionParticipant } from "../../types/database";

// Test case type for code execution
export interface TestCase {
	input: any;
	output: any;
	result?: string;
	status: "pending" | "pass" | "fail" | "running";
}

// Output message for console
export interface OutputMessage {
	message: string;
	status: string;
}

// Chat message type
export interface ChatMessage {
	id: string;
	user_id: string;
	session_id: string;
	username: string;
	message: string;
	created_at: string;
}

// Mobile view options
export type MobileView = "code" | "problem" | "chat";

// User awareness state for Yjs
export interface UserAwarenessState {
	user?: {
		id: string;
		name: string;
		color: string;
		colorLight?: string;
	};
	cursor?: {
		lineNumber: number;
		column: number;
	} | null;
}

// Collaboration document interface
export interface CollaborationDocumentInterface {
	readonly sessionId: string;
	readonly fileId: string;
	ydoc: Y.Doc;
	awareness: Awareness;
	getText(): Y.Text;
	connect(): void;
	disconnect(): void;
	isConnected(): boolean;
	updateCursor(cursor: { lineNumber: number; column: number } | null): void;
}

// File info for editor
export interface CollaborativeFile {
	id: string;
	filename: string;
	language: string;
	content: string;
}

// Collaboration page state
export interface CollaborationPageState {
	// Session state
	session: Session | null;
	participants: SessionParticipant[];
	loading: boolean;
	error: string | null;
	currentUserId: string;
	currentUserName: string;
	showWaitingLobby: boolean;

	// Timer state
	seconds: number;
	timeStr: string;

	// Yjs collaboration state
	collaborationDoc: CollaborationDocumentInterface | null;
	isYjsConnected: boolean;
	remoteCursors: Map<number, UserAwarenessState>;

	// Editor state
	starterCode: string;
	output: OutputMessage[];
	testCases: TestCase[];

	// UI state
	isChatOpen: boolean;
	isMicOn: boolean;
	activeProblemTab: string;
	mobileView: MobileView;
	isMobile: boolean;

	// Submission state
	hasClickedSubmit: boolean;
	hasSubmitted: boolean;
	showWaitingModal: boolean;
	isProcessingFinalSubmission: boolean;
}

// Chat panel props (presentational)
export interface ChatPanelProps {
	messages: ChatMessage[];
	inputMessage: string;
	currentUserId: string;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
	isMicOn: boolean;
	onMicToggle: () => void;
	onSendMessage: (e: React.FormEvent) => void;
	onInputChange: (value: string) => void;
	isMobile?: boolean;
}

// Waiting lobby props (presentational)
export interface WaitingLobbyProps {
	session: Session;
	participants: SessionParticipant[];
	currentUserId: string;
	timeElapsed: number;
	isHost: boolean;
	canStart: boolean;
	joinedCount: number;
	invitedCount: number;
	declinedCount: number;
	allPlayersJoined: boolean;
	onStartSession?: () => void;
}

// Waiting for submission modal props (presentational)
export interface WaitingForSubmissionModalProps {
	isOpen: boolean;
	participants: SessionParticipant[];
	currentUserId: string;
	elapsedTime: number;
	redirectCountdown: number | null;
	readyCount: number;
	submittedCount: number;
	allReady: boolean;
	allSubmitted: boolean;
	onLeave: () => void;
}
