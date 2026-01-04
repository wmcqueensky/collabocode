import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import {
	Users,
	Clock,
	Code,
	Play,
	Send,
	ChevronLeft,
	Menu,
	MessageSquare,
	CheckCircle,
	Rocket,
	Wifi,
	WifiOff,
} from "lucide-react";

// Components
import { OutputPanel } from "../match/editor/OutputPanel";
import { ChatPanel } from "../match/chat/ChatPanel";
import { WaitingLobby } from "../match/lobby/WaitingLobby";
import { ProblemPanel } from "../match/problem-panel/ProblemPanel";
import CollaborativeMonacoEditor from "./components/CollaborativeMonacoEditor";
import WaitingForSubmissionModal from "./components/WaitingForSubmissionModal";

// Services
import { supabase } from "../../lib/supabase";
import { sessionService } from "../../services/sessionService";
import { executeCode } from "../../services/judge0Service";
import { SupabaseYjsProvider } from "../../services/yjs/supabaseYjsProvider";
import {
	getUserColor,
	type UserAwareness,
	type CollaborationDocument,
} from "../../services/yjs/collaborationDocument";

// Types
import type { Session, SessionParticipant } from "../../types/database";

interface TestCase {
	input: any;
	output: any;
	result?: string;
	status: "pending" | "pass" | "fail" | "running";
}

/**
 * Adapter class that wraps SupabaseYjsProvider to match CollaborationDocument interface
 * This allows us to use single-file collaboration with the existing CollaborativeMonacoEditor
 */
class CollaborationDocumentAdapter implements CollaborationDocument {
	public readonly provider: SupabaseYjsProvider;
	public readonly sessionId: string;
	public readonly fileId: string;
	private _isConnected: boolean = false;

	constructor(
		provider: SupabaseYjsProvider,
		sessionId: string,
		fileId: string = "main"
	) {
		this.provider = provider;
		this.sessionId = sessionId;
		this.fileId = fileId;
	}

	get ydoc(): Y.Doc {
		return this.provider.doc;
	}

	get awareness(): Awareness {
		return this.provider.awareness;
	}

	getText(): Y.Text {
		return this.provider.doc.getText("content");
	}

	connect(): void {
		// Already connected via provider
		this._isConnected = true;
	}

	disconnect(): void {
		this.provider.destroy();
		this._isConnected = false;
	}

	isConnected(): boolean {
		return this._isConnected;
	}

	updateCursor(cursor: { lineNumber: number; column: number } | null): void {
		const localState = this.provider.awareness.getLocalState() as UserAwareness;
		this.provider.setLocalState({
			...localState,
			cursor,
		});
	}
}

export default function CollaborationPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();

	// Session state
	const [session, setSession] = useState<Session | null>(null);
	const [participants, setParticipants] = useState<SessionParticipant[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [currentUserName, setCurrentUserName] = useState<string>("");
	const [showWaitingLobby, setShowWaitingLobby] = useState(true);

	// Timer state
	const [seconds, setSeconds] = useState(0);
	const [timeStr, setTimeStr] = useState("00:00");

	// Yjs Collaboration state - single shared document
	const yjsProviderRef = useRef<SupabaseYjsProvider | null>(null);
	const [collaborationDoc, setCollaborationDoc] =
		useState<CollaborationDocument | null>(null);
	const [isYjsConnected, setIsYjsConnected] = useState(false);
	const [remoteCursors, setRemoteCursors] = useState<
		Map<number, UserAwareness>
	>(new Map());

	// Editor state
	const [starterCode, setStarterCode] = useState<string>("");
	const [output, setOutput] = useState<
		Array<{ message: string; status: string }>
	>([{ message: "// Console output will appear here", status: "normal" }]);
	const [testCases, setTestCases] = useState<TestCase[]>([]);

	// UI state
	const [isChatOpen, setIsChatOpen] = useState(true);
	const [isMicOn, setIsMicOn] = useState(false);
	const [activeProblemTab, setActiveProblemTab] = useState("description");
	const [mobileView, setMobileView] = useState<"code" | "problem" | "chat">(
		"code"
	);
	const [isMobile, setIsMobile] = useState(false);

	// Submission state
	const [hasSubmitted, setHasSubmitted] = useState(false);
	const [showWaitingModal, setShowWaitingModal] = useState(false);

	// Check screen size
	useEffect(() => {
		const checkScreenSize = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			if (mobile) {
				setIsChatOpen(false);
			} else {
				setIsChatOpen(true);
			}
		};

		checkScreenSize();
		window.addEventListener("resize", checkScreenSize);
		return () => window.removeEventListener("resize", checkScreenSize);
	}, []);

	// Load current user
	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setCurrentUserId(user.id);

				const { data: profile } = await supabase
					.from("profiles")
					.select("username")
					.eq("id", user.id)
					.single();

				setCurrentUserName(
					profile?.username || user.email?.split("@")[0] || "User"
				);
			} else {
				navigate("/explore");
			}
		};
		loadUser();
	}, [navigate]);

	// Load session data
	useEffect(() => {
		if (!sessionId || !currentUserId) return;

		const loadSession = async () => {
			try {
				setLoading(true);

				const sessionData = await sessionService.getSessionById(sessionId);
				if (!sessionData) {
					setError("Session not found");
					return;
				}

				// Redirect if wrong session type
				if (sessionData.type !== "collaboration") {
					navigate(`/match/${sessionId}`);
					return;
				}

				setSession(sessionData);

				const participantsData = await sessionService.getSessionParticipants(
					sessionId
				);
				setParticipants(participantsData);

				// Check if current user has already submitted
				const currentParticipant = participantsData.find(
					(p) => p.user_id === currentUserId
				);
				if (currentParticipant?.submission_time) {
					setHasSubmitted(true);
					setShowWaitingModal(true);
				}

				// Check session status
				if (sessionData.status === "in_progress") {
					setShowWaitingLobby(false);
				} else if (sessionData.status === "completed") {
					navigate(`/collaboration-summary/${sessionId}`);
					return;
				}

				// Initialize test cases from problem
				if (sessionData.problem?.test_cases) {
					const cases = sessionData.problem.test_cases.map((tc: any) => ({
						input: tc.input,
						output: tc.output,
						status: "pending" as const,
					}));
					setTestCases(cases);
				}

				// Get starter code
				if (sessionData.problem?.starter_code) {
					const code =
						sessionData.problem.starter_code[sessionData.language] ||
						sessionData.problem.starter_code.javascript ||
						"// Start coding here";
					setStarterCode(code);
				}
			} catch (err: any) {
				console.error("Error loading session:", err);
				setError(err.message || "Failed to load session");
			} finally {
				setLoading(false);
			}
		};

		loadSession();
	}, [sessionId, currentUserId, navigate]);

	// Initialize Yjs provider for shared collaboration document
	useEffect(() => {
		if (
			!sessionId ||
			!currentUserId ||
			!currentUserName ||
			showWaitingLobby ||
			!session
		) {
			return;
		}

		// Create single shared document for the session
		const roomName = `collab-${sessionId}`;
		const doc = new Y.Doc();

		const provider = new SupabaseYjsProvider(roomName, doc, currentUserId);

		// Set user awareness (cursor color, name)
		const colors = getUserColor(currentUserId);
		provider.setLocalState({
			user: {
				id: currentUserId,
				name: currentUserName,
				color: colors.color,
				colorLight: colors.light,
			},
			cursor: null,
		});

		// Handle sync
		provider.onSync(() => {
			console.log(`[Yjs] Synced for collaboration session: ${sessionId}`);
			setIsYjsConnected(true);

			// Initialize with starter code if document is empty
			const ytext = provider.doc.getText("content");
			if (ytext.toString() === "" && starterCode) {
				ytext.insert(0, starterCode);
			}

			// Create the adapter that implements CollaborationDocument interface
			const adapter = new CollaborationDocumentAdapter(
				provider,
				sessionId,
				"main"
			);
			adapter.connect();
			setCollaborationDoc(adapter);
		});

		// Handle awareness changes (remote cursors)
		provider.onAwarenessChange((states) => {
			setRemoteCursors(states);
		});

		yjsProviderRef.current = provider;

		return () => {
			provider.destroy();
			yjsProviderRef.current = null;
			setCollaborationDoc(null);
		};
	}, [
		sessionId,
		currentUserId,
		currentUserName,
		showWaitingLobby,
		session,
		starterCode,
	]);

	// Subscribe to real-time participant updates
	useEffect(() => {
		if (!sessionId || showWaitingLobby) return;

		const participantChannel = supabase
			.channel(`collaboration-participants:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "session_participants",
					filter: `session_id=eq.${sessionId}`,
				},
				async () => {
					const updated = await sessionService.getSessionParticipants(
						sessionId
					);
					setParticipants(updated);
				}
			)
			.subscribe();

		const sessionChannel = supabase
			.channel(`collaboration-session:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "sessions",
					filter: `id=eq.${sessionId}`,
				},
				(payload) => {
					const updated = payload.new as Session;
					setSession((prev) => (prev ? { ...prev, ...updated } : null));

					if (updated.status === "completed") {
						navigate(`/collaboration-summary/${sessionId}`);
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(participantChannel);
			supabase.removeChannel(sessionChannel);
		};
	}, [sessionId, showWaitingLobby, navigate]);

	// Timer effect
	useEffect(() => {
		if (!session || showWaitingLobby || !session.started_at) return;

		const startTime = new Date(session.started_at).getTime();
		const totalTime = session.time_limit * 60 * 1000;

		const updateTimer = () => {
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, totalTime - elapsed);
			const remainingSeconds = Math.floor(remaining / 1000);

			setSeconds(remainingSeconds);
			const mins = Math.floor(remainingSeconds / 60);
			const secs = remainingSeconds % 60;
			setTimeStr(`${mins}:${secs.toString().padStart(2, "0")}`);

			if (remainingSeconds === 0 && !hasSubmitted) {
				handleSubmit();
			}
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [session, showWaitingLobby, hasSubmitted]);

	// Handle start session
	const handleStartSession = async () => {
		if (!session || !sessionId) return;

		try {
			await sessionService.updateSessionStatus(sessionId, "in_progress");
			setShowWaitingLobby(false);
		} catch (err: any) {
			console.error("Error starting session:", err);
			setError(err.message || "Failed to start session");
		}
	};

	// Get current code from Yjs document
	const getCurrentCode = useCallback((): string => {
		if (yjsProviderRef.current) {
			return yjsProviderRef.current.doc.getText("content").toString();
		}
		return starterCode;
	}, [starterCode]);

	// Handle run code
	const handleRun = async () => {
		if (!session) {
			setOutput([{ message: "No session loaded", status: "fail" }]);
			return;
		}

		const code = getCurrentCode();
		setOutput([{ message: "Running code...", status: "normal" }]);

		try {
			const results = await Promise.all(
				testCases.map(async (testCase) => {
					try {
						const result = await executeCode(
							code,
							session.language,
							JSON.stringify(testCase.input)
						);
						const passed =
							result.status === "success" &&
							result.output?.trim() === JSON.stringify(testCase.output);
						return {
							...testCase,
							result: result.output?.trim() || "",
							status: passed ? ("pass" as const) : ("fail" as const),
						};
					} catch {
						return { ...testCase, result: "Error", status: "fail" as const };
					}
				})
			);

			setTestCases(results);

			const passedCount = results.filter((r) => r.status === "pass").length;
			const newOutput = results.flatMap((result, index) => [
				{ message: `Running test case ${index + 1}...`, status: "normal" },
				{
					message:
						result.status === "pass"
							? `✓ Test case ${index + 1} passed`
							: `✗ Test case ${index + 1} failed`,
					status: result.status,
				},
			]);
			newOutput.push({
				message: `${passedCount}/${results.length} test cases passed`,
				status: passedCount === results.length ? "pass" : "fail",
			});

			setOutput(newOutput);
		} catch (err: any) {
			setOutput([
				{ message: "Error running code", status: "fail" },
				{ message: err.message || "Unknown error", status: "fail" },
			]);
		}
	};

	// Handle submit
	const handleSubmit = async () => {
		if (!sessionId || !session || hasSubmitted) return;

		setOutput([{ message: "Submitting solution...", status: "normal" }]);

		try {
			const code = getCurrentCode();

			// Run tests
			const results = await Promise.all(
				testCases.map(async (testCase) => {
					try {
						const result = await executeCode(
							code,
							session.language,
							JSON.stringify(testCase.input)
						);
						return (
							result.status === "success" &&
							result.output?.trim() === JSON.stringify(testCase.output)
						);
					} catch {
						return false;
					}
				})
			);

			const allPassed = results.every((r) => r);
			const passedCount = results.filter((r) => r).length;

			// Submit to database
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				await supabase
					.from("session_participants")
					.update({
						submission_time: new Date().toISOString(),
						code_snapshot: code,
						is_correct: allPassed,
						test_results: { passedCount, totalCount: results.length, results },
					})
					.eq("session_id", sessionId)
					.eq("user_id", user.id);
			}

			setHasSubmitted(true);
			setShowWaitingModal(true);

			setOutput([
				{ message: "✓ Solution submitted successfully!", status: "pass" },
				{
					message: `${passedCount}/${results.length} test cases passed`,
					status: allPassed ? "pass" : "fail",
				},
			]);
		} catch (err: any) {
			console.error("Error submitting:", err);
			setOutput([
				{ message: "Error submitting solution", status: "fail" },
				{ message: err.message || "Unknown error", status: "fail" },
			]);
		}
	};

	// Handle all submitted - navigate back to explore
	const handleAllSubmitted = () => {
		navigate("/explore");
	};

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-[#171717]">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-400">Loading collaboration session...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !session) {
		return (
			<div className="flex flex-col items-center justify-center h-screen bg-[#171717]">
				<div className="text-red-400 text-xl mb-4">
					{error || "Session not found"}
				</div>
				<button
					onClick={() => navigate("/explore")}
					className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
				>
					Back to Explore
				</button>
			</div>
		);
	}

	// Waiting lobby
	if (showWaitingLobby) {
		return (
			<WaitingLobby
				session={session}
				participants={participants}
				currentUserId={currentUserId}
				onStartSession={handleStartSession}
			/>
		);
	}

	// File info for the editor
	const file = {
		id: sessionId || "main",
		filename: `solution.${
			session.language === "javascript"
				? "js"
				: session.language === "typescript"
				? "ts"
				: "py"
		}`,
		language: session.language,
		content: starterCode,
	};

	return (
		<div className="flex flex-col h-screen bg-[#171717] text-gray-200">
			{/* Waiting for Submission Modal */}
			<WaitingForSubmissionModal
				isOpen={showWaitingModal}
				participants={participants}
				currentUserId={currentUserId}
				onAllSubmitted={handleAllSubmitted}
			/>

			{/* Navbar */}
			<nav className="flex items-center justify-between px-3 py-2 bg-[#2c2c2c] border-b border-gray-700">
				<div className="flex items-center space-x-3">
					<button
						onClick={() => navigate("/explore")}
						className="p-1.5 hover:bg-gray-700 rounded text-gray-400"
					>
						<ChevronLeft size={18} />
					</button>
					<div className="flex items-center space-x-2">
						<Rocket size={18} className="text-purple-500" />
						<span className="font-medium text-white truncate max-w-[200px]">
							{session.problem?.title || "Collaboration"}
						</span>
					</div>

					{/* Connection Status */}
					<div className="flex items-center space-x-1 text-xs">
						{isYjsConnected ? (
							<div className="flex items-center text-green-400">
								<Wifi size={12} className="mr-1" />
								<span className="hidden sm:inline">Live</span>
							</div>
						) : (
							<div className="flex items-center text-yellow-400">
								<WifiOff size={12} className="mr-1 animate-pulse" />
								<span className="hidden sm:inline">Connecting...</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center space-x-3">
					{/* Active Collaborators */}
					<div className="hidden sm:flex items-center space-x-1">
						<div className="flex -space-x-2">
							{Array.from(remoteCursors.values())
								.filter((state) => state.user?.id !== currentUserId)
								.slice(0, 3)
								.map((state, i) => (
									<div
										key={state.user?.id || i}
										className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 border-gray-800"
										style={{ backgroundColor: state.user?.color }}
										title={state.user?.name}
									>
										{state.user?.name?.charAt(0).toUpperCase()}
									</div>
								))}
						</div>
						{remoteCursors.size > 0 && (
							<span className="text-xs text-gray-400 ml-1">
								{remoteCursors.size} online
							</span>
						)}
					</div>

					{/* Timer */}
					<div className="flex items-center space-x-1 px-2 py-1 bg-gray-700 rounded text-sm">
						<Clock
							size={14}
							className={seconds < 300 ? "text-red-400" : "text-gray-400"}
						/>
						<span className={seconds < 300 ? "text-red-400" : "text-white"}>
							{timeStr}
						</span>
					</div>

					{/* Run & Submit */}
					<button
						onClick={handleRun}
						className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
					>
						<Play size={14} />
						<span className="hidden sm:inline">Run</span>
					</button>
					<button
						onClick={handleSubmit}
						disabled={hasSubmitted}
						className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm ${
							hasSubmitted
								? "bg-green-600 text-white cursor-not-allowed"
								: "bg-purple-500 hover:bg-purple-600 text-white"
						}`}
					>
						{hasSubmitted ? <CheckCircle size={14} /> : <Send size={14} />}
						<span className="hidden sm:inline">
							{hasSubmitted ? "Submitted" : "Submit"}
						</span>
					</button>
				</div>
			</nav>

			{/* Mobile Navigation */}
			{isMobile && (
				<div className="flex bg-[#2c2c2c] border-b border-gray-700">
					<button
						className={`flex-1 py-2 text-xs flex items-center justify-center space-x-1 ${
							mobileView === "problem"
								? "bg-purple-500 text-white"
								: "text-gray-400"
						}`}
						onClick={() => setMobileView("problem")}
					>
						<Menu size={14} />
						<span>Problem</span>
					</button>
					<button
						className={`flex-1 py-2 text-xs flex items-center justify-center space-x-1 ${
							mobileView === "code"
								? "bg-purple-500 text-white"
								: "text-gray-400"
						}`}
						onClick={() => setMobileView("code")}
					>
						<Code size={14} />
						<span>Code</span>
					</button>
					<button
						className={`flex-1 py-2 text-xs flex items-center justify-center space-x-1 ${
							mobileView === "chat"
								? "bg-purple-500 text-white"
								: "text-gray-400"
						}`}
						onClick={() => setMobileView("chat")}
					>
						<MessageSquare size={14} />
						<span>Chat</span>
					</button>
				</div>
			)}

			{/* Main Content */}
			<div className="flex flex-1 overflow-hidden">
				{/* Desktop Layout */}
				{!isMobile && (
					<>
						{/* Problem Panel */}
						<ProblemPanel
							activeTab={activeProblemTab}
							setActiveTab={setActiveProblemTab}
							testCases={testCases}
							runTest={handleRun}
							problem={session.problem}
						/>

						{/* Code Editor Section */}
						<div className="flex flex-col flex-1 border-l border-r border-gray-700">
							{/* File Tab */}
							<div className="flex items-center px-3 py-2 bg-[#2c2c2c] border-b border-gray-700">
								<div className="flex items-center space-x-2 px-3 py-1 bg-[#171717] rounded text-sm text-white">
									<Code size={14} className="text-purple-400" />
									<span>{file.filename}</span>
									{isYjsConnected && (
										<span className="text-green-400 text-xs">● Live</span>
									)}
								</div>
							</div>

							{/* Collaborative Monaco Editor */}
							<CollaborativeMonacoEditor
								file={file}
								collaborationDoc={collaborationDoc}
								userId={currentUserId}
							/>

							{/* Output Panel */}
							<OutputPanel output={output} />
						</div>

						{/* Right Panel - Chat */}
						{isChatOpen && (
							<div className="w-80 flex flex-col bg-[#1a1a1a] border-l border-gray-700">
								<ChatPanel
									isMicOn={isMicOn}
									setIsMicOn={setIsMicOn}
									sessionId={sessionId}
								/>
							</div>
						)}
					</>
				)}

				{/* Mobile Layout */}
				{isMobile && (
					<div className="flex flex-col flex-1 overflow-hidden">
						{mobileView === "problem" && (
							<div className="flex-1 overflow-hidden">
								<ProblemPanel
									activeTab={activeProblemTab}
									setActiveTab={setActiveProblemTab}
									testCases={testCases}
									runTest={handleRun}
									problem={session.problem}
									isMobile={true}
								/>
							</div>
						)}

						{mobileView === "code" && (
							<div className="flex flex-col flex-1 overflow-hidden">
								<CollaborativeMonacoEditor
									file={file}
									collaborationDoc={collaborationDoc}
									userId={currentUserId}
									isMobile={true}
								/>
								<OutputPanel output={output} isMobile={true} />
							</div>
						)}

						{mobileView === "chat" && (
							<div className="flex-1 overflow-hidden">
								<ChatPanel
									isMicOn={isMicOn}
									setIsMicOn={setIsMicOn}
									sessionId={sessionId}
									isMobile={true}
								/>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Footer - Desktop */}
			{!isMobile && (
				<div className="flex items-center justify-between px-4 py-2 bg-[#2c2c2c] border-t border-gray-700 text-xs text-gray-400">
					<div className="flex items-center space-x-4">
						<span className="text-purple-400 font-medium">
							Collaboration Mode
						</span>
						<span>{session.language}</span>
						{isYjsConnected && (
							<span className="text-green-400">● Real-time sync active</span>
						)}
					</div>
					<div className="flex items-center space-x-4">
						<button
							onClick={() => setIsChatOpen(!isChatOpen)}
							className={`px-2 py-1 rounded ${
								isChatOpen
									? "bg-purple-500/20 text-purple-400"
									: "hover:bg-gray-700"
							}`}
						>
							{isChatOpen ? "Hide Chat" : "Show Chat"}
						</button>
					</div>
				</div>
			)}

			{/* Footer - Mobile */}
			{isMobile && (
				<div className="flex items-center justify-between px-3 py-2 bg-[#2c2c2c] border-t border-gray-700 text-xs">
					<div className="flex items-center space-x-2 text-gray-400">
						<Clock size={12} />
						<span>{timeStr}</span>
						{isYjsConnected && <span className="text-green-400">●</span>}
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={handleRun}
							className="px-3 py-1.5 bg-gray-700 text-white rounded text-xs"
						>
							Run
						</button>
						<button
							onClick={handleSubmit}
							disabled={hasSubmitted}
							className={`px-3 py-1.5 rounded text-xs ${
								hasSubmitted
									? "bg-green-600 text-white"
									: "bg-purple-500 text-white"
							}`}
						>
							{hasSubmitted ? "Done ✓" : "Submit"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
