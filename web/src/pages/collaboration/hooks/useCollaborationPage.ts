import { useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sessionService } from "../../../services/sessionService";
import { getFileExtension } from "../constants";

// Modular hooks
import { useCollaborationUser } from "./useCollaborationUser";
import { useCollaborationSession } from "./useCollaborationSession";
import { useCollaborationUI } from "./useCollaborationUI";
import { useCollaborationTimer } from "./useCollaborationTimer";
import { useCollaborationYjs } from "./useCollaborationYjs";
import { useCollaborationSubmission } from "./useCollaborationSubmission";

export function useCollaborationPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();

	// User hook
	const {
		currentUserId,
		currentUserName,
		loading: userLoading,
	} = useCollaborationUser();

	// Session hook
	const {
		session,
		participants,
		loading: sessionLoading,
		error,
		showWaitingLobby,
		testCases,
		starterCode,
		hasClickedSubmit,
		hasSubmitted,
		setHasClickedSubmit,
		handleStartSession,
	} = useCollaborationSession({
		sessionId,
		currentUserId,
	});

	// UI hook
	const {
		isChatOpen,
		isMicOn,
		activeProblemTab,
		mobileView,
		isMobile,
		toggleChat,
		toggleMic,
		setActiveProblemTab,
		setMobileView,
	} = useCollaborationUI();

	// Yjs collaboration hook
	const { collaborationDoc, isYjsConnected, remoteCursors, getCurrentCode } =
		useCollaborationYjs({
			sessionId,
			currentUserId,
			currentUserName,
			starterCode,
		});

	// Submission hook with timer callback
	const handleTimeUp = useCallback(async () => {
		if (!hasClickedSubmit) {
			// Auto-submit when time is up
			// We'll trigger this through the submission hook
		}
	}, [hasClickedSubmit]);

	const {
		output,
		showWaitingModal,
		isProcessingFinalSubmission,
		handleRun,
		handleRunTest,
		handleSubmit,
		processFinalSubmission,
	} = useCollaborationSubmission({
		sessionId,
		session,
		testCases,
		getCurrentCode,
		onSubmitStart: () => {
			setHasClickedSubmit(true);
		},
	});

	// Timer hook
	const { seconds, timeStr } = useCollaborationTimer({
		session,
		showWaitingLobby,
		hasClickedSubmit,
		onTimeUp: handleTimeUp,
	});

	// Subscribe to check if all participants are ready for final submission
	useEffect(() => {
		if (
			!sessionId ||
			showWaitingLobby ||
			!hasClickedSubmit ||
			hasSubmitted ||
			isProcessingFinalSubmission
		)
			return;

		const interval = setInterval(async () => {
			const participants =
				await sessionService.getSessionParticipants(sessionId);
			const joinedParticipants = participants.filter(
				(p) => p.status === "joined",
			);
			const allReadyToSubmit = joinedParticipants.every((p) => {
				const testResults = p.test_results as any;
				return testResults?.ready_to_submit || testResults?.final_submission;
			});

			if (allReadyToSubmit && joinedParticipants.length > 0) {
				console.log("All participants ready - processing final submission");
				await processFinalSubmission();
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [
		sessionId,
		showWaitingLobby,
		hasClickedSubmit,
		hasSubmitted,
		isProcessingFinalSubmission,
		processFinalSubmission,
	]);

	// Handle all submitted - navigate back to explore
	const handleAllSubmitted = () => {
		navigate("/explore");
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
		loading: sessionLoading || userLoading,
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
		handleRunTest,
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
