import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { SessionParticipant } from "../../../types/database";
import { SUBMISSION_REDIRECT_COUNTDOWN } from "../constants";

interface UseWaitingForSubmissionModalProps {
	isOpen: boolean;
	participants: SessionParticipant[];
	onAllSubmitted?: () => void;
}

export function useWaitingForSubmissionModal({
	isOpen,
	participants,
	onAllSubmitted,
}: UseWaitingForSubmissionModalProps) {
	const navigate = useNavigate();
	const [elapsedTime, setElapsedTime] = useState(0);
	const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
		null,
	);

	// Timer for elapsed time
	useEffect(() => {
		if (!isOpen) {
			setElapsedTime(0);
			setRedirectCountdown(null);
			return;
		}

		const interval = setInterval(() => {
			setElapsedTime((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [isOpen]);

	// Check if all participants are ready to submit
	const joinedParticipants = participants.filter((p) => p.status === "joined");

	// Check for ready_to_submit flag in test_results (new way)
	// or fall back to submission_time (old way for backward compatibility)
	const readyCount = joinedParticipants.filter((p) => {
		const testResults = p.test_results as any;
		return testResults?.ready_to_submit || p.submission_time;
	}).length;

	// Check if all have final_submission (actual code submitted)
	const submittedCount = joinedParticipants.filter((p) => {
		const testResults = p.test_results as any;
		return testResults?.final_submission;
	}).length;

	const allReady =
		readyCount === joinedParticipants.length && joinedParticipants.length > 0;
	const allSubmitted =
		submittedCount === joinedParticipants.length &&
		joinedParticipants.length > 0;

	// Handle redirect countdown when all submitted
	useEffect(() => {
		if (allSubmitted && redirectCountdown === null) {
			setRedirectCountdown(SUBMISSION_REDIRECT_COUNTDOWN);
		}
	}, [allSubmitted, redirectCountdown]);

	// Countdown effect
	useEffect(() => {
		if (redirectCountdown === null) return;

		if (redirectCountdown === 0) {
			if (onAllSubmitted) {
				onAllSubmitted();
			} else {
				navigate("/explore");
			}
			return;
		}

		const timer = setTimeout(() => {
			setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
		}, 1000);

		return () => clearTimeout(timer);
	}, [redirectCountdown, onAllSubmitted, navigate]);

	// Handle leave action
	const handleLeave = () => {
		navigate("/explore");
	};

	return {
		elapsedTime,
		redirectCountdown,
		joinedParticipants,
		readyCount,
		submittedCount,
		allReady,
		allSubmitted,
		handleLeave,
	};
}
