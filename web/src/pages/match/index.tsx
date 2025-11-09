import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlayCircle, Mic } from "lucide-react";
import { OutputPanel } from "./editor/OutputPanel";
import { ProblemPanel } from "./problem-panel/ProblemPanel";
import { Navbar } from "./layout/Navbar";
import { ChatPanel } from "./chat/ChatPanel";
import { MonacoEditor } from "./editor/MonacoEditor";
import Footer from "./layout/Footer";
import { RaceTrack } from "./chat/RaceTrack";
import { RecentActivities } from "./chat/RecentActivities";

// Services and hooks
import { useSession } from "../../hooks/useSession";
import { sessionService } from "../../services/sessionService";
import { supabase } from "../../lib/supabase";
import { executeCode } from "../../services/judge0Service";
import type { Profile } from "../../types/database";

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
	status: "idle" | "typing" | "thinking";
	finishPosition: number | null;
	isCorrect: boolean;
}

interface Activity {
	id: number;
	type: "passed" | "failed" | "ran" | "modifying" | "submitted";
	message: string;
	timestamp: string;
}

export default function MatchPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();

	// Hooks
	const {
		session,
		participants: dbParticipants,
		loading,
		error,
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

	// State for activities
	const [activities, setActivities] = useState<Activity[]>([]);

	// Current user
	const [currentUserId, setCurrentUserId] = useState<string>("");

	// Load current user
	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setCurrentUserId(user.id);
			} else {
				navigate("/explore");
			}
		};
		loadUser();
	}, [navigate]);

	// Load session data
	useEffect(() => {
		if (!session) return;

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
	}, [session]);

	// Transform DB participants to UI participants
	useEffect(() => {
		if (!dbParticipants || !currentUserId) return;

		const transformed = dbParticipants.map((p, index) => {
			const isCurrentUser = p.user_id === currentUserId;
			const progress = p.is_correct
				? 100
				: (p.test_results?.passedCount || 0) * 25; // Estimate progress

			return {
				id: p.user_id,
				name: isCurrentUser ? "You" : p.user?.username || "Player",
				progress,
				status: "idle" as const,
				finishPosition: p.ranking || null,
				isCorrect: p.is_correct || false,
			};
		});

		setParticipants(transformed);
	}, [dbParticipants, currentUserId]);

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
				if (newSeconds === 0) {
					handleSubmit();
				}

				return newSeconds;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [timerStarted, seconds]);

	// Subscribe to real-time participant updates
	useEffect(() => {
		if (!sessionId) return;

		const channel = supabase
			.channel(`session:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "session_participants",
					filter: `session_id=eq.${sessionId}`,
				},
				(payload) => {
					console.log("Participant update:", payload);

					// Add activity for participant updates
					if (payload.eventType === "UPDATE") {
						const participant = payload.new as any;
						const user = dbParticipants?.find(
							(p) => p.user_id === participant.user_id
						);

						if (
							participant.is_correct &&
							participant.user_id !== currentUserId
						) {
							addActivity({
								type: "submitted",
								message: `${
									user?.user?.username || "Player"
								} completed the problem!`,
								timestamp: "now",
							});
						}
					}
				}
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [sessionId, dbParticipants, currentUserId]);

	// Add activity helper
	const addActivity = (activity: Omit<Activity, "id">) => {
		setActivities((prev) => [
			{
				...activity,
				id: Date.now(),
			},
			...prev.slice(0, 9), // Keep last 10 activities
		]);
	};

	// Run single test case
	const runTest = async (testIndex: number | "all") => {
		if (!session?.problem) return;

		setOutput([{ message: "Running tests...", status: "normal" }]);

		// Add activity
		addActivity({
			type: "ran",
			message: `You ran Test Case ${
				testIndex === "all" ? "All" : testIndex + 1
			}`,
			timestamp: "now",
		});

		try {
			if (testIndex === "all") {
				// Run all test cases
				const results = await Promise.all(
					testCases.map(async (testCase, index) => {
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

				// Update progress
				const progress = Math.round((passedCount / results.length) * 100);
				setParticipants((prev) =>
					prev.map((p) => (p.id === currentUserId ? { ...p, progress } : p))
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

				// Add activity for pass/fail
				if (passed) {
					addActivity({
						type: "passed",
						message: `You passed Test Case ${testIndex + 1}`,
						timestamp: "now",
					});
				} else {
					addActivity({
						type: "failed",
						message: `You failed Test Case ${testIndex + 1}`,
						timestamp: "now",
					});
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

	// Handle Run button
	const handleRun = () => {
		runTest("all");
	};

	// Handle Submit button
	const handleSubmit = async () => {
		if (!sessionId || !session) return;

		setOutput([{ message: "Submitting solution...", status: "normal" }]);

		try {
			// Run all tests first
			const results = await Promise.all(
				testCases.map(async (testCase) => {
					const result = await executeCode(
						code,
						language,
						JSON.stringify(testCase.input)
					);

					return (
						result.status === "success" &&
						result.output?.trim() === JSON.stringify(testCase.output)
					);
				})
			);

			const allPassed = results.every((r) => r);
			const passedCount = results.filter((r) => r).length;

			// Submit to database
			await submitCode(code, {
				allPassed,
				passedCount,
				totalCount: results.length,
				results,
			});

			// Update output
			setOutput([
				{ message: "Validating solution...", status: "normal" },
				{ message: "Running test cases...", status: "normal" },
				{
					message: `✓ ${passedCount}/${results.length} test cases passed`,
					status: allPassed ? "pass" : "fail",
				},
				...(allPassed
					? [
							{ message: "✓ Solution accepted!", status: "pass" },
							{ message: "✓ All tests passed successfully", status: "pass" },
					  ]
					: [
							{ message: "✗ Some tests failed", status: "fail" },
							{ message: "Please review and try again", status: "normal" },
					  ]),
			]);

			// Update participant progress
			setParticipants((prev) =>
				prev.map((p) =>
					p.id === currentUserId
						? {
								...p,
								progress: 100,
								isCorrect: allPassed,
								finishPosition: allPassed ? 1 : null,
						  }
						: p
				)
			);

			// Add activity
			addActivity({
				type: "submitted",
				message: allPassed
					? "You completed the problem!"
					: "You submitted your solution",
				timestamp: "now",
			});

			// If all passed, navigate to summary after delay
			if (allPassed) {
				setTimeout(() => {
					navigate(`/match-summary/${sessionId}`);
				}, 2000);
			}
		} catch (error: any) {
			console.error("Error submitting:", error);
			setOutput([
				{ message: "Error submitting solution", status: "fail" },
				{ message: error.message || "Unknown error", status: "fail" },
			]);
		}
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
