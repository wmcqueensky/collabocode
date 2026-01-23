import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "../../../hooks/useSession";
import { matchCompletionService } from "../../../services/matchCompletionService";
import {
	sessionActivityService,
	type SessionActivity,
} from "../../../services/sessionActivityService";
import { supabase } from "../../../lib/supabase";
import { executeCode } from "../../../services/judge0Service";

import {
	formatTime,
	formatActivityTimestamp,
	calculateProgress,
	DEFAULT_OUTPUT,
} from "../constants";
import type {
	TestCase,
	Participant,
	Activity,
	ActivityType,
	ActivePanel,
	OutputLine,
	SubmissionResult,
} from "../types";

interface UseMatchPageProps {
	sessionId: string | undefined;
}

export const useMatchPage = ({ sessionId }: UseMatchPageProps) => {
	const navigate = useNavigate();

	// Session hook
	const {
		session,
		participants: dbParticipants,
		loading,
		error,
		updateTestProgress,
		submitCode,
		updateStatus,
	} = useSession(sessionId || null);

	// Timer state
	const [seconds, setSeconds] = useState(0);
	const [timeStr, setTimeStr] = useState("00:00");
	const [timerStarted, setTimerStarted] = useState(false);

	// UI state
	const [activeProblemTab, setActiveProblemTab] = useState("description");
	const [isChatOpen, setIsChatOpen] = useState(true);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activePanel, setActivePanel] = useState<ActivePanel>("editor");
	const [isMicOn, setIsMicOn] = useState(false);

	// Code editor state
	const [code, setCode] = useState("");
	const [language, setLanguage] = useState("javascript");

	// Test cases state
	const [testCases, setTestCases] = useState<TestCase[]>([]);
	const [output, setOutput] = useState<OutputLine[]>(DEFAULT_OUTPUT);

	// Participants state
	const [participants, setParticipants] = useState<Participant[]>([]);

	// Activities state
	const [activities, setActivities] = useState<Activity[]>([]);

	// User state
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [currentUsername, setCurrentUsername] = useState<string>("");

	// Session state
	const [showWaitingLobby, setShowWaitingLobby] = useState(true);
	const [showSubmissionModal, setShowSubmissionModal] = useState(false);
	const [submissionResult, setSubmissionResult] =
		useState<SubmissionResult | null>(null);
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
					user.user_metadata?.username || user.email?.split("@")[0] || "User",
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

		if (session.status === "in_progress") {
			setShowWaitingLobby(false);
			return;
		}

		if (session.status === "completed") {
			navigate("/explore");
			return;
		}

		const currentParticipant = dbParticipants.find(
			(p) => p.user_id === currentUserId,
		);

		if (session.status === "waiting") {
			setShowWaitingLobby(true);
		}

		if (currentParticipant?.submission_time) {
			setHasSubmitted(true);
		}
	}, [session, dbParticipants, currentUserId, navigate]);

	// Handle starting the session (only for host)
	const handleStartSession = useCallback(async () => {
		if (!session || !sessionId) return;

		try {
			await updateStatus("in_progress");
			setShowWaitingLobby(false);
		} catch (error) {
			console.error("Error starting session:", error);
		}
	}, [session, sessionId, updateStatus]);

	// Load session data
	useEffect(() => {
		if (!session || showWaitingLobby) return;

		setLanguage(session.language);

		if (session.problem?.starter_code) {
			const starterCode = session.problem.starter_code[session.language];
			setCode(starterCode || "// Write your code here");
		}

		if (session.problem?.test_cases) {
			const cases = session.problem.test_cases.map((tc: any) => ({
				input: tc.input,
				output: tc.output,
				status: "pending" as const,
			}));
			setTestCases(cases);
		}

		if (session.started_at) {
			const startTime = new Date(session.started_at).getTime();
			const currentTime = Date.now();
			const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
			const totalTimeSeconds = session.time_limit * 60;
			const remainingSeconds = Math.max(0, totalTimeSeconds - elapsedSeconds);

			setSeconds(remainingSeconds);
			setTimeStr(formatTime(remainingSeconds));
			setTimerStarted(true);
		}
	}, [session, showWaitingLobby]);

	// Transform DB participants to UI participants
	useEffect(() => {
		if (!dbParticipants || !currentUserId) return;

		const transformed = dbParticipants
			.filter((p) => p.status === "joined")
			.map((p) => {
				const isCurrentUser = p.user_id === currentUserId;
				const testResults =
					(p.test_results as { passedCount?: number; totalCount?: number }) ||
					{};
				const passedCount = testResults.passedCount || 0;
				const totalCount = testResults.totalCount || testCases.length;

				const progress = calculateProgress(
					p.is_correct || false,
					passedCount,
					totalCount,
				);

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
				setTimeStr(formatTime(newSeconds));

				if (newSeconds === 0 && !hasSubmitted) {
					handleSubmit();
				}

				return newSeconds;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [timerStarted, seconds, hasSubmitted]);

	// Format activity from DB to UI
	const formatActivity = useCallback(
		(dbActivity: SessionActivity): Activity => {
			const isCurrentUser = dbActivity.user_id === currentUserId;
			const timestamp = formatActivityTimestamp(dbActivity.created_at);

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
		[currentUserId],
	);

	// Load and subscribe to activities
	useEffect(() => {
		if (!sessionId || showWaitingLobby || !currentUserId) return;

		const loadActivities = async () => {
			try {
				const existingActivities =
					await sessionActivityService.getActivities(sessionId);
				const formattedActivities: Activity[] = existingActivities.map(
					(a: SessionActivity) => formatActivity(a),
				);
				setActivities(formattedActivities);
			} catch (error) {
				console.error("Error loading activities:", error);
			}
		};

		loadActivities();

		const channel = sessionActivityService.subscribeToActivities(
			sessionId,
			(newActivity: SessionActivity) => {
				if (newActivity.user_id === currentUserId) {
					setActivities((prev) => {
						const tempIndex = prev.findIndex(
							(a) => a.id.startsWith("temp-") && a.userId === currentUserId,
						);
						if (tempIndex !== -1) {
							const updated = [...prev];
							updated[tempIndex] = formatActivity(newActivity);
							return updated;
						}
						if (prev.some((a) => a.id === newActivity.id)) {
							return prev;
						}
						return prev;
					});
					return;
				}

				setActivities((prev) => {
					if (prev.some((a) => a.id === newActivity.id)) {
						return prev;
					}
					return [formatActivity(newActivity), ...prev.slice(0, 9)];
				});
			},
		);

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionId, showWaitingLobby, currentUserId, formatActivity]);

	// Auto-finalization setup
	useEffect(() => {
		if (!sessionId || showWaitingLobby) return;

		const cleanup = matchCompletionService.setupAutoFinalization(sessionId);
		return cleanup;
	}, [sessionId, showWaitingLobby]);

	// Add activity helper
	const addActivity = useCallback(
		async (type: ActivityType, message: string) => {
			if (!sessionId || !currentUserId || !currentUsername) return;

			const tempId = `temp-${Date.now()}`;
			const newActivity: Activity = {
				id: tempId,
				type,
				message,
				timestamp: "now",
				userId: currentUserId,
			};

			setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

			try {
				await sessionActivityService.addActivity(
					sessionId,
					currentUserId,
					currentUsername,
					type,
					message.replace("You", currentUsername),
				);
			} catch (error) {
				console.error("Error saving activity:", error);
			}
		},
		[sessionId, currentUserId, currentUsername],
	);

	// Run test cases
	const runTest = useCallback(
		async (testIndex: number | "all") => {
			if (!session?.problem) return;

			setOutput([{ message: "Running tests...", status: "normal" }]);

			try {
				if (testIndex === "all") {
					const results = await Promise.all(
						testCases.map(async (testCase) => {
							const result = await executeCode(
								code,
								language,
								JSON.stringify(testCase.input),
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
						}),
					);

					setTestCases(results);

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

					await updateTestProgress(code, {
						passedCount,
						totalCount: results.length,
						results: results.map((r) => r.status === "pass"),
					});

					setParticipants((prev) =>
						prev.map((p) =>
							p.id === currentUserId
								? { ...p, progress: (passedCount / results.length) * 100 }
								: p,
						),
					);

					await addActivity(
						"ran",
						`You ran all test cases (${passedCount}/${results.length} passed)`,
					);
				} else {
					const testCase = testCases[testIndex];

					const result = await executeCode(
						code,
						language,
						JSON.stringify(testCase.input),
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

					const passedCount = updatedTestCases.filter(
						(tc) => tc.status === "pass",
					).length;
					const totalCount = updatedTestCases.length;

					await updateTestProgress(code, {
						passedCount,
						totalCount,
						results: updatedTestCases.map((tc) => tc.status === "pass"),
					});

					setParticipants((prev) =>
						prev.map((p) =>
							p.id === currentUserId
								? { ...p, progress: (passedCount / totalCount) * 100 }
								: p,
						),
					);

					if (passed) {
						await addActivity(
							"passed",
							`You passed Test Case ${testIndex + 1}`,
						);
					} else {
						await addActivity(
							"failed",
							`You failed Test Case ${testIndex + 1}`,
						);
					}
				}
			} catch (error: any) {
				console.error("Error running tests:", error);
				setOutput([
					{ message: "Error running tests", status: "fail" },
					{ message: error.message || "Unknown error", status: "fail" },
				]);
			}
		},
		[
			session?.problem,
			testCases,
			code,
			language,
			currentUserId,
			updateTestProgress,
			addActivity,
		],
	);

	// Handle run button
	const handleRun = useCallback(() => {
		runTest("all");
	}, [runTest]);

	// Handle submit
	const handleSubmit = useCallback(async () => {
		if (!sessionId || !session || hasSubmitted) return;

		setOutput([{ message: "Submitting solution...", status: "normal" }]);

		try {
			const results = await Promise.all(
				testCases.map(async (testCase) => {
					try {
						const result = await executeCode(
							code,
							language,
							JSON.stringify(testCase.input),
						);

						return (
							result.status === "success" &&
							result.output?.trim() === JSON.stringify(testCase.output)
						);
					} catch (error) {
						console.error("Error executing test case:", error);
						return false;
					}
				}),
			);

			const allPassed = results.every((r) => r);
			const passedCount = results.filter((r) => r).length;

			await submitCode(code, {
				allPassed,
				passedCount,
				totalCount: results.length,
				results,
			});

			setHasSubmitted(true);

			setSubmissionResult({
				allPassed,
				passedCount,
				totalCount: results.length,
			});

			setShowSubmissionModal(true);

			setParticipants((prev) =>
				prev.map((p) =>
					p.id === currentUserId
						? {
								...p,
								progress: 100,
								isCorrect: allPassed,
								status: "complete",
							}
						: p,
				),
			);

			await addActivity(
				"submitted",
				allPassed
					? "You completed the problem!"
					: "You submitted your solution",
			);

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
	}, [
		sessionId,
		session,
		hasSubmitted,
		testCases,
		code,
		language,
		currentUserId,
		submitCode,
		addActivity,
	]);

	// Handle modal close
	const handleModalClose = useCallback(() => {
		setShowSubmissionModal(false);
		navigate("/explore");
	}, [navigate]);

	// Update code
	const updateCode = useCallback(
		(newCode: string) => {
			setCode(newCode);

			setParticipants((prev) =>
				prev.map((p) =>
					p.id === currentUserId ? { ...p, status: "typing" } : p,
				),
			);

			setTimeout(() => {
				setParticipants((prev) =>
					prev.map((p) =>
						p.id === currentUserId ? { ...p, status: "idle" } : p,
					),
				);
			}, 2000);
		},
		[currentUserId],
	);

	return {
		// Session data
		session,
		dbParticipants,
		loading,
		error,
		sessionId,

		// Timer
		timeStr,

		// UI state
		activeProblemTab,
		setActiveProblemTab,
		isChatOpen,
		setIsChatOpen,
		isMobileMenuOpen,
		setIsMobileMenuOpen,
		activePanel,
		setActivePanel,
		isMicOn,
		setIsMicOn,

		// Code editor
		code,
		language,
		updateCode,

		// Test cases
		testCases,
		output,
		runTest,

		// Participants
		participants,

		// Activities
		activities,

		// User
		currentUserId,

		// Session state
		showWaitingLobby,
		showSubmissionModal,
		submissionResult,

		// Actions
		handleStartSession,
		handleRun,
		handleSubmit,
		handleModalClose,
	};
};
