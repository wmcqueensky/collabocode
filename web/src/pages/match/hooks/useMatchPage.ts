import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "../../../hooks/useSession";
import { matchCompletionService } from "../../../services/matchCompletionService";

import type { SubmissionResult } from "../types";

// Modular hooks
import { useCurrentUser } from "./useCurrentUser";
import { useMatchUI } from "./useMatchUI";
import { useMatchTimer } from "./useMatchTimer";
import { useMatchActivities } from "./useMatchActivities";
import { useMatchParticipants } from "./useMatchParticipants";
import { useMatchTestRunner } from "./useMatchTestRunner";

interface UseMatchPageProps {
	sessionId: string | undefined;
}

export const useMatchPage = ({ sessionId }: UseMatchPageProps) => {
	const navigate = useNavigate();

	// Current user
	const {
		currentUserId,
		currentUsername,
		loading: userLoading,
	} = useCurrentUser();

	// Session hook
	const {
		session,
		participants: dbParticipants,
		loading: sessionLoading,
		error,
		updateTestProgress,
		submitCode,
		updateStatus,
	} = useSession(sessionId || null);

	// UI state
	const {
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
	} = useMatchUI();

	// Code editor state
	const [code, setCode] = useState("");
	const [language, setLanguage] = useState("javascript");

	// Session state
	const [showWaitingLobby, setShowWaitingLobby] = useState(true);
	const [showSubmissionModal, setShowSubmissionModal] = useState(false);
	const [submissionResult, setSubmissionResult] =
		useState<SubmissionResult | null>(null);
	const [hasSubmitted, setHasSubmitted] = useState(false);

	// Timer state
	const [timerStarted, setTimerStarted] = useState(false);
	const [initialSeconds, setInitialSeconds] = useState(0);

	// Activities
	const { activities, addActivity } = useMatchActivities({
		sessionId,
		currentUserId,
		currentUsername,
		enabled: !showWaitingLobby,
	});

	// Activity log callback for test runner
	const handleActivityLog = useCallback(
		async (type: "passed" | "failed" | "ran", message: string) => {
			await addActivity(type, message);
		},
		[addActivity],
	);

	// Test runner
	const { testCases, output, setTestCases, runTest, runAllTests } =
		useMatchTestRunner({
			code,
			language,
			onActivityLog: handleActivityLog,
		});

	// Participants
	const {
		participants,
		updateParticipantProgress,
		updateParticipantStatus,
		markParticipantComplete,
	} = useMatchParticipants({
		dbParticipants,
		currentUserId,
		testCasesLength: testCases.length,
	});

	// Handle submit (declared early for timer callback)
	const handleSubmit = useCallback(async () => {
		if (!sessionId || !session || hasSubmitted) return;

		try {
			const { passedCount, totalCount, results } = await runAllTests();
			const allPassed = results.every((r) => r);

			await submitCode(code, {
				allPassed,
				passedCount,
				totalCount,
				results,
			});

			setHasSubmitted(true);

			setSubmissionResult({
				allPassed,
				passedCount,
				totalCount,
			});

			setShowSubmissionModal(true);

			markParticipantComplete(currentUserId, allPassed);

			await addActivity(
				"submitted",
				allPassed
					? "You completed the problem!"
					: "You submitted your solution",
			);
		} catch (error: any) {
			console.error("Error submitting:", error);
			setHasSubmitted(false);
		}
	}, [
		sessionId,
		session,
		hasSubmitted,
		code,
		currentUserId,
		submitCode,
		addActivity,
		markParticipantComplete,
		runAllTests,
	]);

	// Timer - auto submit on time up
	const handleTimeUp = useCallback(() => {
		if (!hasSubmitted) {
			handleSubmit();
		}
	}, [hasSubmitted, handleSubmit]);

	const { timeStr } = useMatchTimer({
		initialSeconds,
		started: timerStarted,
		onTimeUp: handleTimeUp,
	});

	// Combined loading state
	const loading = userLoading || sessionLoading;

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

			setInitialSeconds(remainingSeconds);
			setTimerStarted(true);
		}
	}, [session, showWaitingLobby, setTestCases]);

	// Auto-finalization setup
	useEffect(() => {
		if (!sessionId || showWaitingLobby) return;

		const cleanup = matchCompletionService.setupAutoFinalization(sessionId);
		return cleanup;
	}, [sessionId, showWaitingLobby]);

	// Handle run button
	const handleRun = useCallback(async () => {
		await runTest("all");

		// Update progress after test run
		const passedCount = testCases.filter((tc) => tc.status === "pass").length;
		const totalCount = testCases.length;

		if (totalCount > 0) {
			await updateTestProgress(code, {
				passedCount,
				totalCount,
				results: testCases.map((tc) => tc.status === "pass"),
			});

			updateParticipantProgress(
				currentUserId,
				(passedCount / totalCount) * 100,
			);
		}
	}, [
		runTest,
		testCases,
		code,
		currentUserId,
		updateTestProgress,
		updateParticipantProgress,
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

			updateParticipantStatus(currentUserId, "typing");

			setTimeout(() => {
				updateParticipantStatus(currentUserId, "idle");
			}, 2000);
		},
		[currentUserId, updateParticipantStatus],
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
