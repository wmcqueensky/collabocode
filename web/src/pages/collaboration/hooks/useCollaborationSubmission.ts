import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { sessionService } from "../../../services/sessionService";
import { executeCode } from "../../../services/judge0Service";
import type { Session } from "../../../types/database";
import type { OutputMessage, TestCase } from "../types";

interface UseCollaborationSubmissionProps {
	sessionId: string | undefined;
	session: Session | null;
	testCases: TestCase[];
	getCurrentCode: () => string;
	onSubmitStart?: () => void;
}

interface UseCollaborationSubmissionReturn {
	output: OutputMessage[];
	showWaitingModal: boolean;
	isProcessingFinalSubmission: boolean;
	handleRun: () => Promise<void>;
	handleRunTest: (index: number | "all") => Promise<void>;
	handleSubmit: () => Promise<void>;
	processFinalSubmission: () => Promise<void>;
	setOutput: (output: OutputMessage[]) => void;
	setShowWaitingModal: (show: boolean) => void;
	setTestCases: (testCases: TestCase[]) => void;
}

export function useCollaborationSubmission({
	sessionId,
	session,
	testCases,
	getCurrentCode,
	onSubmitStart,
}: UseCollaborationSubmissionProps): UseCollaborationSubmissionReturn {
	const [output, setOutput] = useState<OutputMessage[]>([
		{ message: "// Console output will appear here", status: "normal" },
	]);
	const [showWaitingModal, setShowWaitingModal] = useState(false);
	const [isProcessingFinalSubmission, setIsProcessingFinalSubmission] =
		useState(false);
	const [localTestCases, setTestCases] = useState<TestCase[]>(testCases);

	// Sync localTestCases when testCases prop changes
	useEffect(() => {
		if (testCases.length > 0 && localTestCases.length === 0) {
			setTestCases(testCases);
		}
	}, [testCases, localTestCases.length]);

	// Handle run code
	const handleRun = useCallback(async () => {
		if (!session) {
			setOutput([{ message: "No session loaded", status: "fail" }]);
			return;
		}

		const code = getCurrentCode();
		setOutput([{ message: "Running code...", status: "normal" }]);

		try {
			const results = await Promise.all(
				localTestCases.map(async (testCase) => {
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
	}, [session, localTestCases, getCurrentCode]);

	// Handle running a single test or all tests
	const handleRunTest = useCallback(
		async (index: number | "all") => {
			if (!session) {
				setOutput([{ message: "No session loaded", status: "fail" }]);
				return;
			}

			// If "all", run all tests
			if (index === "all") {
				await handleRun();
				return;
			}

			// Run single test
			const testCase = localTestCases[index];
			if (!testCase) {
				setOutput([
					{ message: `Test case ${index + 1} not found`, status: "fail" },
				]);
				return;
			}

			const code = getCurrentCode();
			setOutput([
				{ message: `Running test case ${index + 1}...`, status: "normal" },
			]);

			try {
				const result = await executeCode(
					code,
					session.language,
					JSON.stringify(testCase.input),
				);
				const passed =
					result.status === "success" &&
					result.output?.trim() === JSON.stringify(testCase.output);

				// Update only this test case in localTestCases
				const updatedTestCases = localTestCases.map((tc, i) =>
					i === index
						? {
								...tc,
								result: result.output?.trim() || "",
								status: passed ? ("pass" as const) : ("fail" as const),
							}
						: tc,
				);
				setTestCases(updatedTestCases);

				setOutput([
					{
						message: passed
							? `✓ Test case ${index + 1} passed`
							: `✗ Test case ${index + 1} failed`,
						status: passed ? "pass" : "fail",
					},
					{
						message: `Output: ${result.output?.trim() || "(empty)"}`,
						status: "normal",
					},
					{
						message: `Expected: ${JSON.stringify(testCase.output)}`,
						status: "normal",
					},
				]);
			} catch (err: any) {
				// Update test case as failed
				const updatedTestCases = localTestCases.map((tc, i) =>
					i === index
						? { ...tc, result: "Error", status: "fail" as const }
						: tc,
				);
				setTestCases(updatedTestCases);

				setOutput([
					{ message: `✗ Test case ${index + 1} failed`, status: "fail" },
					{ message: err.message || "Unknown error", status: "fail" },
				]);
			}
		},
		[session, localTestCases, getCurrentCode, handleRun],
	);

	// Process final submission when all players are ready
	const processFinalSubmission = useCallback(async () => {
		if (!sessionId || !session || isProcessingFinalSubmission) return;

		setIsProcessingFinalSubmission(true);
		console.log("Processing final submission for all players...");

		try {
			// Get the FINAL code from Yjs (shared, latest version)
			const finalCode = getCurrentCode();

			// Run tests on the final code
			const results = await Promise.all(
				localTestCases.map(async (testCase) => {
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
		localTestCases,
		getCurrentCode,
		isProcessingFinalSubmission,
	]);

	// Handle submit - marks user as ready, waits for all players
	const handleSubmit = useCallback(async () => {
		if (!sessionId || !session) return;

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

			setShowWaitingModal(true);
			onSubmitStart?.();

			setOutput([
				{ message: "✓ You're ready to submit!", status: "pass" },
				{ message: "Waiting for teammates to submit...", status: "normal" },
			]);

			// Check if all participants are already ready (we might be the last one)
			const updatedParticipants =
				await sessionService.getSessionParticipants(sessionId);
			const joinedParticipants = updatedParticipants.filter(
				(p: any) => p.status === "joined",
			);
			const allReadyToSubmit = joinedParticipants.every((p: any) => {
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
	}, [sessionId, session, processFinalSubmission, onSubmitStart]);

	return {
		output,
		showWaitingModal,
		isProcessingFinalSubmission,
		handleRun,
		handleRunTest,
		handleSubmit,
		processFinalSubmission,
		setOutput,
		setShowWaitingModal,
		setTestCases,
	};
}
