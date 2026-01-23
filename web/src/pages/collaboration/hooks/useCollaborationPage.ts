import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import { supabase } from "../../../lib/supabase";
import { sessionService } from "../../../services/sessionService";
import { executeCode } from "../../../services/judge0Service";
import { SupabaseYjsProvider } from "../../../services/yjs/supabaseYjsProvider";
import {
	getUserColor,
	type UserAwareness,
} from "../../../services/yjs/collaborationDocument";
import type { Session, SessionParticipant } from "../../../types/database";
import type {
	TestCase,
	OutputMessage,
	MobileView,
	CollaborationDocumentInterface,
	UserAwarenessState,
} from "../types";
import {
	DEFAULT_OUTPUT,
	MOBILE_BREAKPOINT,
	getFileExtension,
} from "../constants";

/**
 * Adapter class that wraps SupabaseYjsProvider to match CollaborationDocument interface
 */
class CollaborationDocumentAdapter implements CollaborationDocumentInterface {
	public readonly provider: SupabaseYjsProvider;
	public readonly sessionId: string;
	public readonly fileId: string;
	private _isConnected: boolean = false;

	constructor(
		provider: SupabaseYjsProvider,
		sessionId: string,
		fileId: string = "main",
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

export function useCollaborationPage() {
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

	// Yjs Collaboration state
	const yjsProviderRef = useRef<SupabaseYjsProvider | null>(null);
	const [collaborationDoc, setCollaborationDoc] =
		useState<CollaborationDocumentInterface | null>(null);
	const [isYjsConnected, setIsYjsConnected] = useState(false);
	const [remoteCursors, setRemoteCursors] = useState<
		Map<number, UserAwarenessState>
	>(new Map());

	// Editor state
	const [starterCode, setStarterCode] = useState<string>("");
	const [output, setOutput] = useState<OutputMessage[]>(DEFAULT_OUTPUT);
	const [testCases, setTestCases] = useState<TestCase[]>([]);

	// UI state
	const [isChatOpen, setIsChatOpen] = useState(true);
	const [isMicOn, setIsMicOn] = useState(false);
	const [activeProblemTab, setActiveProblemTab] = useState("description");
	const [mobileView, setMobileView] = useState<MobileView>("code");
	const [isMobile, setIsMobile] = useState(false);

	// Submission state
	const [hasClickedSubmit, setHasClickedSubmit] = useState(false);
	const [hasSubmitted, setHasSubmitted] = useState(false);
	const [showWaitingModal, setShowWaitingModal] = useState(false);
	const [isProcessingFinalSubmission, setIsProcessingFinalSubmission] =
		useState(false);

	// Check screen size
	useEffect(() => {
		const checkScreenSize = () => {
			const mobile = window.innerWidth < MOBILE_BREAKPOINT;
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
					profile?.username || user.email?.split("@")[0] || "User",
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

				if (sessionData.type !== "collaboration") {
					navigate(`/match/${sessionId}`);
					return;
				}

				setSession(sessionData);

				const participantsData =
					await sessionService.getSessionParticipants(sessionId);
				setParticipants(participantsData);

				// Check if current user has already marked ready_to_submit
				const currentParticipant = participantsData.find(
					(p) => p.user_id === currentUserId,
				);
				if (currentParticipant?.submission_time) {
					const testResults = currentParticipant.test_results as any;
					if (testResults?.ready_to_submit && !testResults?.final_submission) {
						setHasClickedSubmit(true);
						setShowWaitingModal(true);
					} else if (testResults?.final_submission) {
						setHasSubmitted(true);
						setShowWaitingModal(true);
					}
				}

				if (sessionData.status === "in_progress") {
					setShowWaitingLobby(false);
				} else if (sessionData.status === "completed") {
					navigate(`/collaboration-summary/${sessionId}`);
					return;
				}

				if (sessionData.problem?.test_cases) {
					const cases = sessionData.problem.test_cases.map((tc: any) => ({
						input: tc.input,
						output: tc.output,
						status: "pending" as const,
					}));
					setTestCases(cases);
				}

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

	// Initialize Yjs provider
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

		const roomName = `collab-${sessionId}`;
		const doc = new Y.Doc();

		const provider = new SupabaseYjsProvider(roomName, doc, currentUserId);

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

		provider.onSync(() => {
			console.log(`[Yjs] Synced for collaboration session: ${sessionId}`);
			setIsYjsConnected(true);

			const ytext = provider.doc.getText("content");
			if (ytext.toString() === "" && starterCode) {
				ytext.insert(0, starterCode);
			}

			const adapter = new CollaborationDocumentAdapter(
				provider,
				sessionId,
				"main",
			);
			adapter.connect();
			setCollaborationDoc(adapter);
		});

		provider.onAwarenessChange((states) => {
			setRemoteCursors(states as Map<number, UserAwarenessState>);
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

	// Get current code from Yjs document
	const getCurrentCode = useCallback((): string => {
		if (yjsProviderRef.current) {
			return yjsProviderRef.current.doc.getText("content").toString();
		}
		return starterCode;
	}, [starterCode]);

	// Process final submission when all players are ready
	const processFinalSubmission = useCallback(async () => {
		if (!sessionId || !session || isProcessingFinalSubmission || hasSubmitted)
			return;

		setIsProcessingFinalSubmission(true);
		console.log("Processing final submission for all players...");

		try {
			// Get the FINAL code from Yjs (shared, latest version)
			const finalCode = getCurrentCode();

			// Run tests on the final code
			const results = await Promise.all(
				testCases.map(async (testCase) => {
					try {
						const result = await executeCode(
							finalCode,
							session.language,
							JSON.stringify(testCase.input),
						);
						return (
							result.status === "success" &&
							result.output?.trim() === JSON.stringify(testCase.output)
						);
					} catch {
						return false;
					}
				}),
			);

			const allPassed = results.every((r) => r);
			const passedCount = results.filter((r) => r).length;

			// Update current user's record with final submission
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				await supabase
					.from("session_participants")
					.update({
						code_snapshot: finalCode,
						is_correct: allPassed,
						test_results: {
							passedCount,
							totalCount: results.length,
							results,
							ready_to_submit: true,
							final_submission: true,
						},
					})
					.eq("session_id", sessionId)
					.eq("user_id", user.id);
			}

			setHasSubmitted(true);

			setOutput([
				{ message: "✓ Team solution submitted successfully!", status: "pass" },
				{
					message: `${passedCount}/${results.length} test cases passed`,
					status: allPassed ? "pass" : "fail",
				},
			]);
		} catch (err: any) {
			console.error("Error processing final submission:", err);
			setOutput([
				{ message: "Error submitting solution", status: "fail" },
				{ message: err.message || "Unknown error", status: "fail" },
			]);
		} finally {
			setIsProcessingFinalSubmission(false);
		}
	}, [
		sessionId,
		session,
		isProcessingFinalSubmission,
		hasSubmitted,
		getCurrentCode,
		testCases,
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
					const updated =
						await sessionService.getSessionParticipants(sessionId);
					setParticipants(updated);

					// Check if all participants are now ready to submit
					const joinedParticipants = updated.filter(
						(p) => p.status === "joined",
					);
					const allReadyToSubmit = joinedParticipants.every((p) => {
						const testResults = p.test_results as any;
						return (
							testResults?.ready_to_submit || testResults?.final_submission
						);
					});

					// If all ready and we clicked submit but haven't processed final yet
					if (
						allReadyToSubmit &&
						joinedParticipants.length > 0 &&
						hasClickedSubmit &&
						!hasSubmitted &&
						!isProcessingFinalSubmission
					) {
						console.log("All participants ready - processing final submission");
						await processFinalSubmission();
					}
				},
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
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(participantChannel);
			supabase.removeChannel(sessionChannel);
		};
	}, [
		sessionId,
		showWaitingLobby,
		navigate,
		hasClickedSubmit,
		hasSubmitted,
		isProcessingFinalSubmission,
		processFinalSubmission,
	]);

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

			if (remainingSeconds === 0 && !hasClickedSubmit) {
				handleSubmit();
			}
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [session, showWaitingLobby, hasClickedSubmit]);

	// Handle start session
	const handleStartSession = async () => {
		if (!session || !sessionId) return;

		try {
			await sessionService.updateSessionStatus(sessionId, "in_progress");

			const updatedSession = await sessionService.getSessionById(sessionId);
			if (updatedSession) {
				setSession(updatedSession);
			}

			setShowWaitingLobby(false);
		} catch (err: any) {
			console.error("Error starting session:", err);
			setError(err.message || "Failed to start session");
		}
	};

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
							JSON.stringify(testCase.input),
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
				}),
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

	// Handle submit - marks user as ready, waits for all players
	const handleSubmit = async () => {
		if (!sessionId || !session || hasClickedSubmit) return;

		setOutput([{ message: "Marking as ready to submit...", status: "normal" }]);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				// Mark this user as ready (don't capture code yet - wait for all)
				await supabase
					.from("session_participants")
					.update({
						submission_time: new Date().toISOString(),
						test_results: {
							ready_to_submit: true,
							final_submission: false,
						},
					})
					.eq("session_id", sessionId)
					.eq("user_id", user.id);
			}

			setHasClickedSubmit(true);
			setShowWaitingModal(true);

			setOutput([
				{ message: "✓ You're ready to submit!", status: "pass" },
				{ message: "Waiting for teammates to submit...", status: "normal" },
			]);

			// Check if all participants are already ready (we might be the last one)
			const updatedParticipants =
				await sessionService.getSessionParticipants(sessionId);
			const joinedParticipants = updatedParticipants.filter(
				(p) => p.status === "joined",
			);
			const allReadyToSubmit = joinedParticipants.every((p) => {
				const testResults = p.test_results as any;
				return testResults?.ready_to_submit;
			});

			if (allReadyToSubmit && joinedParticipants.length > 0) {
				console.log(
					"All participants ready (including self) - processing final submission",
				);
				await processFinalSubmission();
			}
		} catch (err: any) {
			console.error("Error marking ready to submit:", err);
			setOutput([
				{ message: "Error marking ready to submit", status: "fail" },
				{ message: err.message || "Unknown error", status: "fail" },
			]);
		}
	};

	// Handle all submitted - navigate back to explore
	const handleAllSubmitted = () => {
		navigate("/explore");
	};

	// Toggle chat panel
	const toggleChat = () => {
		setIsChatOpen(!isChatOpen);
	};

	// Toggle mic
	const toggleMic = () => {
		setIsMicOn(!isMicOn);
	};

	// Get file info for editor
	const getFileInfo = () => {
		if (!session || !sessionId) return null;
		return {
			id: sessionId,
			filename: `solution.${getFileExtension(session.language)}`,
			language: session.language,
			content: starterCode,
		};
	};

	return {
		// Session state
		sessionId,
		session,
		participants,
		loading,
		error,
		currentUserId,
		currentUserName,
		showWaitingLobby,

		// Timer state
		seconds,
		timeStr,

		// Yjs collaboration state
		collaborationDoc,
		isYjsConnected,
		remoteCursors,

		// Editor state
		starterCode,
		output,
		testCases,

		// UI state
		isChatOpen,
		isMicOn,
		activeProblemTab,
		mobileView,
		isMobile,

		// Submission state
		hasClickedSubmit,
		hasSubmitted,
		showWaitingModal,
		isProcessingFinalSubmission,

		// Actions
		handleStartSession,
		handleRun,
		handleSubmit,
		handleAllSubmitted,
		toggleChat,
		toggleMic,
		setActiveProblemTab,
		setMobileView,

		// Utilities
		getFileInfo,
		navigate,
	};
}
