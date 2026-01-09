import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OutputPanel } from "./editor/OutputPanel";
import { ProblemPanel } from "./problem-panel/ProblemPanel";
import { Navbar } from "./layout/Navbar";
import { ChatPanel } from "./chat/ChatPanel";
import { MonacoEditor } from "./editor/MonacoEditor";
import Footer from "./layout/Footer";
import { RaceTrack } from "./chat/RaceTrack";
import { RecentActivities } from "./chat/RecentActivities";
import { WaitingLobby } from "./lobby/WaitingLobby";
import { SubmissionModal } from "./modals/SubmissionModal";

import { useSession } from "../../hooks/useSession";
import { matchCompletionService } from "../../services/matchCompletionService";
import {
	sessionActivityService,
	type SessionActivity,
} from "../../services/sessionActivityService";
import { supabase } from "../../lib/supabase";
import { executeCode } from "../../services/judge0Service";

interface TestCase {
	input: any;
	output: any;
	result?: string;
	status: "pending" | "pass" | "fail" | "running";
}

interface Participant {
	id: string;
	name: string;
	progress: number;
	status: "idle" | "typing" | "thinking" | "complete";
	finishPosition: number | null;
	isCorrect: boolean;
}

interface Activity {
	id: string;
	type: "passed" | "failed" | "ran" | "modifying" | "submitted";
	message: string;
	timestamp: string;
	userId?: string;
}

export default function MatchPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();

	// Hooks - now includes updateTestProgress separate from submitCode
	const {
		session,
		participants: dbParticipants,
		loading,
		error,
		updateTestProgress,
		submitCode,
		updateStatus,
	} = useSession(sessionId || null);

	// State for timer
	const [seconds, setSeconds] = useState(0);
	const [timeStr, setTimeStr] = useState("00:00");
	const [timerStarted, setTimerStarted] = useState(false);

	// State for UI
	const [activeProblemTab, setActiveProblemTab] = useState("description");
	const [isChatOpen, setIsChatOpen] = useState(true);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activePanel, setActivePanel] = useState<"problem" | "editor" | "chat">(
		"editor"
	);
	const [isMicOn, setIsMicOn] = useState(false);

	// State for code editor
	const [code, setCode] = useState("");
	const [language, setLanguage] = useState("javascript");

	// State for test cases
	const [testCases, setTestCases] = useState<TestCase[]>([]);
	const [output, setOutput] = useState<
		Array<{ message: string; status: string }>
	>([{ message: "// Console output will appear here", status: "normal" }]);

	// State for participants (transformed from DB)
	const [participants, setParticipants] = useState<Participant[]>([]);

	// State for activities - now synced from database
	const [activities, setActivities] = useState<Activity[]>([]);

	// Current user
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [currentUsername, setCurrentUsername] = useState<string>("");

	// Check if we should show waiting lobby
	const [showWaitingLobby, setShowWaitingLobby] = useState(true);

	// Submission modal state
	const [showSubmissionModal, setShowSubmissionModal] = useState(false);
	const [submissionResult, setSubmissionResult] = useState<{
		allPassed: boolean;
		passedCount: number;
		totalCount: number;
	} | null>(null);

	// Track if user has already submitted
	const [hasSubmitted, setHasSubmitted] = useState(false);

	// Load current user
	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setCurrentUserId(user.id);
				setCurrentUsername(
					user.user_metadata?.username || user.email?.split("@")[0] || "User"
				);
			} else {
				navigate("/explore");
			}
		};
		loadUser();
	}, [navigate]);

	// Check session status and participants
	useEffect(() => {
		if (!session || !dbParticipants || !currentUserId) return;

		// Check if session has started
		if (session.status === "in_progress") {
			setShowWaitingLobby(false);
			return;
		}

		// If session is completed, redirect to explore
		if (session.status === "completed") {
			navigate("/explore");
			return;
		}

		// Check if current user has joined
		const currentParticipant = dbParticipants.find(
			(p) => p.user_id === currentUserId
		);

		// If session is waiting and not all players joined, show lobby
		if (session.status === "waiting") {
			setShowWaitingLobby(true);
		}

		// Check if current user has already submitted
		if (currentParticipant?.submission_time) {
			setHasSubmitted(true);
		}
	}, [session, dbParticipants, currentUserId, navigate]);

	// Handle starting the session (only for host)
	const handleStartSession = async () => {
		if (!session || !sessionId) return;

		try {
			await updateStatus("in_progress");
			setShowWaitingLobby(false);
		} catch (error) {
			console.error("Error starting session:", error);
		}
	};

	// Load session data
	useEffect(() => {
		if (!session || showWaitingLobby) return;

		// Set language
		setLanguage(session.language);

		// Initialize code with starter code
		if (session.problem?.starter_code) {
			const starterCode = session.problem.starter_code[session.language];
			setCode(starterCode || "// Write your code here");
		}

		// Initialize test cases
		if (session.problem?.test_cases) {
			const cases = session.problem.test_cases.map((tc: any) => ({
				input: tc.input,
				output: tc.output,
				status: "pending" as const,
			}));
			setTestCases(cases);
		}

		// Calculate remaining time based on elapsed time
		if (session.started_at) {
			const startTime = new Date(session.started_at).getTime();
			const currentTime = Date.now();
			const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
			const totalTimeSeconds = session.time_limit * 60;
			const remainingSeconds = Math.max(0, totalTimeSeconds - elapsedSeconds);

			setSeconds(remainingSeconds);

			// Update display immediately
			const minutes = Math.floor(remainingSeconds / 60);
			const secs = remainingSeconds % 60;
			setTimeStr(`${minutes}:${secs.toString().padStart(2, "0")}`);

			setTimerStarted(true);
		}
	}, [session, showWaitingLobby]);

	// Transform DB participants to UI participants
	useEffect(() => {
		if (!dbParticipants || !currentUserId) return;

		const transformed = dbParticipants
			.filter((p) => p.status === "joined") // Only show joined participants
			.map((p) => {
				const isCurrentUser = p.user_id === currentUserId;

				// Calculate progress based on test results
				const testResults =
					(p.test_results as { passedCount?: number; totalCount?: number }) ||
					{};
				const passedCount = testResults.passedCount || 0;
				const totalCount = testResults.totalCount || testCases.length;

				// Calculate progress percentage
				let progress = 0;
				if (p.is_correct) {
					progress = 100; // Completed
				} else if (totalCount > 0) {
					progress = (passedCount / totalCount) * 100;
				}

				return {
					id: p.user_id,
					name: isCurrentUser ? "You" : p.user?.username || "Player",
					progress,
					status: p.is_correct ? ("complete" as const) : ("idle" as const),
					finishPosition: p.ranking || null,
					isCorrect: p.is_correct || false,
				};
			});

		setParticipants(transformed);
	}, [dbParticipants, currentUserId, testCases.length]);

	// Timer countdown
	useEffect(() => {
		if (!timerStarted || seconds <= 0) return;

		const timer = setInterval(() => {
			setSeconds((prevSeconds) => {
				const newSeconds = Math.max(0, prevSeconds - 1);
				const minutes = Math.floor(newSeconds / 60);
				const secs = newSeconds % 60;
				setTimeStr(`${minutes}:${secs.toString().padStart(2, "0")}`);

				// Auto-submit when time runs out
				if (newSeconds === 0 && !hasSubmitted) {
					handleSubmit();
				}

				return newSeconds;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [timerStarted, seconds, hasSubmitted]);

	// Helper to format activity from DB to UI format
	const formatActivity = useCallback(
		(dbActivity: SessionActivity): Activity => {
			const isCurrentUser = dbActivity.user_id === currentUserId;
			const time = new Date(dbActivity.created_at);
			const now = new Date();
			const diffMs = now.getTime() - time.getTime();
			const diffMins = Math.floor(diffMs / 60000);

			let timestamp: string;
			if (diffMins < 1) {
				timestamp = "now";
			} else if (diffMins < 60) {
				timestamp = `${diffMins}m ago`;
			} else {
				timestamp = time.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				});
			}

			// Replace username with "You" for current user
			let message = dbActivity.message;
			if (isCurrentUser && !message.startsWith("You")) {
				message = message.replace(dbActivity.username, "You");
			}

			return {
				id: dbActivity.id,
				type: dbActivity.type,
				message,
				timestamp,
				userId: dbActivity.user_id,
			};
		},
		[currentUserId]
	);

	// Load existing activities and subscribe to new ones
	useEffect(() => {
		if (!sessionId || showWaitingLobby || !currentUserId) return;

		// Load existing activities
		const loadActivities = async () => {
			try {
				const existingActivities = await sessionActivityService.getActivities(
					sessionId
				);
				const formattedActivities: Activity[] = existingActivities.map(
					(a: SessionActivity) => formatActivity(a)
				);
				setActivities(formattedActivities);
			} catch (error) {
				console.error("Error loading activities:", error);
			}
		};

		loadActivities();

		// Subscribe to new activities
		const channel = sessionActivityService.subscribeToActivities(
			sessionId,
			(newActivity: SessionActivity) => {
				console.log("New activity from subscription:", newActivity);

				// Skip if this is from the current user (we already added it optimistically)
				if (newActivity.user_id === currentUserId) {
					// Replace the temp activity with the real one (to get the real ID)
					setActivities((prev) => {
						// Find and replace temp activity with same message pattern
						const tempIndex = prev.findIndex(
							(a) => a.id.startsWith("temp-") && a.userId === currentUserId
						);
						if (tempIndex !== -1) {
							const updated = [...prev];
							updated[tempIndex] = formatActivity(newActivity);
							return updated;
						}
						// If no temp found, check for exact duplicate
						if (prev.some((a) => a.id === newActivity.id)) {
							return prev;
						}
						return prev;
					});
					return;
				}

				setActivities((prev) => {
					// Avoid duplicates
					if (prev.some((a) => a.id === newActivity.id)) {
						return prev;
					}
					// Add new activity at the beginning
					return [formatActivity(newActivity), ...prev.slice(0, 9)];
				});
			}
		);

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionId, showWaitingLobby, currentUserId, formatActivity]);

	// Set up auto-finalization when all participants submit (but don't navigate)
	useEffect(() => {
		if (!sessionId || showWaitingLobby) return;

		const cleanup = matchCompletionService.setupAutoFinalization(sessionId);

		return cleanup;
	}, [sessionId, showWaitingLobby]);

	// Add activity helper - now saves to database
	const addActivity = useCallback(
		async (type: Activity["type"], message: string) => {
			if (!sessionId || !currentUserId || !currentUsername) return;

			// Optimistically add to local state
			const tempId = `temp-${Date.now()}`;
			const newActivity: Activity = {
				id: tempId,
				type,
				message,
				timestamp: "now",
				userId: currentUserId,
			};

			setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

			// Save to database (this will trigger real-time for other users)
			try {
				await sessionActivityService.addActivity(
					sessionId,
					currentUserId,
					currentUsername,
					type,
					message.replace("You", currentUsername) // Store with actual username
				);
			} catch (error) {
				console.error("Error saving activity:", error);
			}
		},
		[sessionId, currentUserId, currentUsername]
	);

	// Run single test case or all test cases
	const runTest = async (testIndex: number | "all") => {
		if (!session?.problem) return;

		setOutput([{ message: "Running tests...", status: "normal" }]);

		try {
			if (testIndex === "all") {
				// Run all test cases
				const results = await Promise.all(
					testCases.map(async (testCase) => {
						const result = await executeCode(
							code,
							language,
							JSON.stringify(testCase.input)
						);

						return {
							...testCase,
							result: result.output?.trim() || "",
							status:
								result.status === "success" &&
								result.output?.trim() === JSON.stringify(testCase.output)
									? ("pass" as const)
									: ("fail" as const),
						};
					})
				);

				setTestCases(results);

				// Build output messages
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

				const passedCount = results.filter((r) => r.status === "pass").length;
				newOutput.push({
					message: `${passedCount}/${results.length} test cases passed`,
					status: passedCount === results.length ? "pass" : "fail",
				});

				setOutput(newOutput);

				// Update progress in database WITHOUT setting submission_time
				await updateTestProgress(code, {
					passedCount,
					totalCount: results.length,
					results: results.map((r) => r.status === "pass"),
				});

				// Update local progress
				setParticipants((prev) =>
					prev.map((p) =>
						p.id === currentUserId
							? { ...p, progress: (passedCount / results.length) * 100 }
							: p
					)
				);

				// Add activity - saves to DB for real-time sync
				await addActivity(
					"ran",
					`You ran all test cases (${passedCount}/${results.length} passed)`
				);
			} else {
				// Run single test case
				const testCase = testCases[testIndex];

				const result = await executeCode(
					code,
					language,
					JSON.stringify(testCase.input)
				);

				const passed =
					result.status === "success" &&
					result.output?.trim() === JSON.stringify(testCase.output);

				const updatedTestCases = [...testCases];
				updatedTestCases[testIndex] = {
					...testCase,
					result: result.output?.trim() || "",
					status: passed ? "pass" : "fail",
				};

				setTestCases(updatedTestCases);

				setOutput([
					{
						message: `Running test case ${testIndex + 1}...`,
						status: "normal",
					},
					{
						message: passed
							? `✓ Test case ${testIndex + 1} passed`
							: `✗ Test case ${testIndex + 1} failed`,
						status: passed ? "pass" : "fail",
					},
				]);

				// Update progress without submission
				const passedCount = updatedTestCases.filter(
					(tc) => tc.status === "pass"
				).length;
				const totalCount = updatedTestCases.length;

				await updateTestProgress(code, {
					passedCount,
					totalCount,
					results: updatedTestCases.map((tc) => tc.status === "pass"),
				});

				// Update local progress
				setParticipants((prev) =>
					prev.map((p) =>
						p.id === currentUserId
							? { ...p, progress: (passedCount / totalCount) * 100 }
							: p
					)
				);

				// Add activity for pass/fail - saves to DB
				if (passed) {
					await addActivity("passed", `You passed Test Case ${testIndex + 1}`);
				} else {
					await addActivity("failed", `You failed Test Case ${testIndex + 1}`);
				}
			}
		} catch (error: any) {
			console.error("Error running tests:", error);
			setOutput([
				{ message: "Error running tests", status: "fail" },
				{ message: error.message || "Unknown error", status: "fail" },
			]);
		}
	};

	// Handle Run button (same as Run All)
	const handleRun = () => {
		runTest("all");
	};

	// Handle Submit button - ACTUAL SUBMISSION
	const handleSubmit = async () => {
		if (!sessionId || !session || hasSubmitted) return;

		setOutput([{ message: "Submitting solution...", status: "normal" }]);

		try {
			// Run all tests first with error handling
			const results = await Promise.all(
				testCases.map(async (testCase) => {
					try {
						const result = await executeCode(
							code,
							language,
							JSON.stringify(testCase.input)
						);

						return (
							result.status === "success" &&
							result.output?.trim() === JSON.stringify(testCase.output)
						);
					} catch (error) {
						console.error("Error executing test case:", error);
						return false;
					}
				})
			);

			const allPassed = results.every((r) => r);
			const passedCount = results.filter((r) => r).length;

			// ACTUAL SUBMISSION - This sets submission_time and triggers finalization
			await submitCode(code, {
				allPassed,
				passedCount,
				totalCount: results.length,
				results,
			});

			// Mark as submitted
			setHasSubmitted(true);

			// Store submission result for modal
			setSubmissionResult({
				allPassed,
				passedCount,
				totalCount: results.length,
			});

			// Show modal
			setShowSubmissionModal(true);

			// Update local participant progress
			setParticipants((prev) =>
				prev.map((p) =>
					p.id === currentUserId
						? {
								...p,
								progress: 100,
								isCorrect: allPassed,
								status: "complete",
						  }
						: p
				)
			);

			// Add activity - saves to DB for other users to see
			await addActivity(
				"submitted",
				allPassed ? "You completed the problem!" : "You submitted your solution"
			);

			// Update output for display
			setOutput([
				{ message: "✓ Solution submitted successfully!", status: "pass" },
				{
					message: `${passedCount}/${results.length} test cases passed`,
					status: allPassed ? "pass" : "fail",
				},
				{
					message: "You'll be notified when all players submit their solutions",
					status: "normal",
				},
			]);
		} catch (error: any) {
			console.error("Error submitting:", error);
			setHasSubmitted(false);

			// Handle rate limit errors
			if (error.message?.includes("429")) {
				setOutput([
					{ message: "⚠️ Rate limit exceeded", status: "fail" },
					{
						message:
							"Judge0 API has reached its rate limit. Please try again in a few moments.",
						status: "normal",
					},
				]);
			} else {
				setOutput([
					{ message: "Error submitting solution", status: "fail" },
					{ message: error.message || "Unknown error", status: "fail" },
				]);
			}
		}
	};

	// Handle modal close - navigate to explore
	const handleModalClose = () => {
		setShowSubmissionModal(false);
		navigate("/explore");
	};

	// Update code
	const updateCode = (newCode: string) => {
		setCode(newCode);

		// Notify others that you're typing (debounced)
		setParticipants((prev) =>
			prev.map((p) => (p.id === currentUserId ? { ...p, status: "typing" } : p))
		);

		// Reset to idle after 2 seconds
		setTimeout(() => {
			setParticipants((prev) =>
				prev.map((p) => (p.id === currentUserId ? { ...p, status: "idle" } : p))
			);
		}, 2000);
	};

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-[#171717]">
				<div className="text-white text-xl">Loading session...</div>
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
					className="bg-[#5bc6ca] hover:bg-[#48aeb3] text-white px-6 py-2 rounded"
				>
					Back to Explore
				</button>
			</div>
		);
	}

	// Show waiting lobby if session hasn't started
	if (showWaitingLobby && dbParticipants) {
		return (
			<WaitingLobby
				session={session}
				participants={dbParticipants}
				currentUserId={currentUserId}
				onStartSession={handleStartSession}
			/>
		);
	}

	// File structure for Monaco Editor
	const file = {
		name: `solution.${
			language === "javascript" ? "js" : language === "python" ? "py" : language
		}`,
		language: language,
		content: code,
	};

	return (
		<div className="flex flex-col h-screen bg-[#171717] text-gray-200">
			{/* Submission Modal */}
			{submissionResult && (
				<SubmissionModal
					isOpen={showSubmissionModal}
					onClose={handleModalClose}
					allPassed={submissionResult.allPassed}
					passedCount={submissionResult.passedCount}
					totalCount={submissionResult.totalCount}
				/>
			)}

			{/* Navbar */}
			<Navbar
				time={timeStr}
				handleRun={handleRun}
				handleSubmit={handleSubmit}
				activePanel={activePanel}
				setActivePanel={setActivePanel}
				isMobileMenuOpen={isMobileMenuOpen}
				setIsMobileMenuOpen={setIsMobileMenuOpen}
				problemTitle={session.problem?.title || "Problem"}
				participantCount={participants.length}
				maxParticipants={session.max_players}
			/>

			{/* Mobile Panel Navigation */}
			<div className="md:hidden flex bg-[#2c2c2c] border-b border-gray-700">
				<button
					className={`flex-1 py-2 px-4 text-sm ${
						activePanel === "problem"
							? "border-b-2 border-[#5bc6ca] text-[#5bc6ca]"
							: "text-gray-400"
					}`}
					onClick={() => setActivePanel("problem")}
				>
					Problem
				</button>
				<button
					className={`flex-1 py-2 px-4 text-sm ${
						activePanel === "editor"
							? "border-b-2 border-[#5bc6ca] text-[#5bc6ca]"
							: "text-gray-400"
					}`}
					onClick={() => setActivePanel("editor")}
				>
					Code
				</button>
				<button
					className={`flex-1 py-2 px-4 text-sm ${
						activePanel === "chat"
							? "border-b-2 border-[#5bc6ca] text-[#5bc6ca]"
							: "text-gray-400"
					}`}
					onClick={() => setActivePanel("chat")}
				>
					Chat
				</button>
			</div>

			{/* Main Content */}
			<div className="flex flex-1 overflow-hidden">
				{/* Desktop Layout */}
				<div className="hidden md:flex flex-1 overflow-hidden">
					{/* Left Panel - Problem Description */}
					<ProblemPanel
						activeTab={activeProblemTab}
						setActiveTab={setActiveProblemTab}
						testCases={testCases}
						runTest={runTest}
						problem={session.problem}
					/>

					{/* Middle Section - Code Editor */}
					<div className="flex flex-1 overflow-hidden border-l border-r border-gray-700">
						<div className="flex flex-col flex-1">
							<MonacoEditor
								file={file}
								updateFileContent={(_: any, content: any) =>
									updateCode(content)
								}
							/>
							<OutputPanel output={output} />
						</div>
					</div>

					{/* Right Panel - Chat */}
					{isChatOpen && (
						<div className="w-80 bg-[#1a1a1a] border-l border-gray-700 flex flex-col">
							<div className="flex-1 min-h-0 max-h-[60%]">
								<ChatPanel
									isMicOn={isMicOn}
									setIsMicOn={setIsMicOn}
									sessionId={sessionId}
								/>
							</div>
							<div className="flex-shrink-0 p-4 space-y-4 bg-[#171717] border-t border-gray-700 overflow-y-auto max-h-[40%]">
								<RaceTrack participants={participants} />
								<RecentActivities activities={activities} />
							</div>
						</div>
					)}
				</div>

				{/* Mobile Layout */}
				<div className="md:hidden flex-1 overflow-hidden">
					{activePanel === "problem" && (
						<ProblemPanel
							activeTab={activeProblemTab}
							setActiveTab={setActiveProblemTab}
							testCases={testCases}
							runTest={runTest}
							isMobile={true}
							problem={session.problem}
						/>
					)}

					{activePanel === "editor" && (
						<div className="flex flex-col h-full">
							<div className="flex-1 min-h-0">
								<MonacoEditor
									file={file}
									updateFileContent={(_: any, content: any) =>
										updateCode(content)
									}
									isMobile={true}
								/>
							</div>
							<div className="h-32 flex-shrink-0">
								<OutputPanel output={output} />
							</div>
						</div>
					)}

					{activePanel === "chat" && (
						<div className="h-full bg-[#1a1a1a] flex flex-col">
							<div className="flex-1 min-h-0">
								<ChatPanel
									isMicOn={isMicOn}
									setIsMicOn={setIsMicOn}
									isMobile={true}
									sessionId={sessionId}
								/>
							</div>
							<div className="flex-shrink-0 max-h-[40%] overflow-y-auto">
								<div className="p-2 space-y-2 bg-[#171717] border-t border-gray-700">
									<RaceTrack participants={participants} isMobile={true} />
									<RecentActivities activities={activities} isMobile={true} />
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<Footer
				isChatOpen={isChatOpen}
				setIsChatOpen={setIsChatOpen}
				activePanel={activePanel}
				setActivePanel={setActivePanel}
			/>
		</div>
	);
}
