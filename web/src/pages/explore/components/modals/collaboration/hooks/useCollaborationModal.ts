import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProblems } from "../../../../../../hooks/useProblems";
import { useUsers } from "../../../../../../hooks/useUsers";
import { sessionService } from "../../../../../../services/sessionService";
import type { Problem, Profile } from "../../../../../../types/database";
import {
	DEFAULT_LANGUAGE,
	DEFAULT_TIME_LIMIT,
	DEFAULT_PLAYER_COUNT,
} from "../constants";

type UseCollaborationModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export const useCollaborationModal = ({
	isOpen,
	onClose,
}: UseCollaborationModalProps) => {
	const navigate = useNavigate();

	// Hooks for data
	const {
		problems,
		loading: problemsLoading,
		error: problemsError,
	} = useProblems();
	const { users, loading: usersLoading, searchUsers } = useUsers();

	// State
	const [step, setStep] = useState(1);
	const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE);
	const [timeLimit, setTimeLimit] = useState<number>(DEFAULT_TIME_LIMIT);
	const [playerCount, setPlayerCount] = useState<number>(DEFAULT_PLAYER_COUNT);
	const [selectedPlayers, setSelectedPlayers] = useState<Profile[]>([]);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Handle ESC key
	useEffect(() => {
		const handleEscKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !creating) {
				onClose();
			}
		};

		window.addEventListener("keydown", handleEscKey);
		return () => window.removeEventListener("keydown", handleEscKey);
	}, [onClose, creating]);

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setStep(1);
			setSelectedProblem(null);
			setSelectedLanguage(DEFAULT_LANGUAGE);
			setTimeLimit(DEFAULT_TIME_LIMIT);
			setPlayerCount(DEFAULT_PLAYER_COUNT);
			setSelectedPlayers([]);
			setError(null);
		}
	}, [isOpen]);

	const startSession = useCallback(async () => {
		if (!selectedProblem) {
			setError("Please select a problem");
			return;
		}

		if (selectedPlayers.length !== playerCount - 1) {
			setError(`Please select ${playerCount - 1} collaborator(s)`);
			return;
		}

		try {
			setCreating(true);
			setError(null);

			// Create the collaboration session
			const session = await sessionService.createSession({
				type: "collaboration",
				problem_id: selectedProblem.id,
				language: selectedLanguage,
				time_limit: timeLimit,
				max_players: playerCount,
				description: `Team collaboration on ${selectedProblem.title}`,
				is_public: false,
				allow_join_in_progress: false,
			});

			// Invite selected players
			if (selectedPlayers.length > 0) {
				const playerIds = selectedPlayers.map((p) => p.id);
				await sessionService.invitePlayers(session.id, playerIds);
			}

			// Navigate to the collaboration page
			navigate(`/collaboration/${session.id}`);
			onClose();
		} catch (err: any) {
			console.error("Error creating collaboration session:", err);
			setError(err.message || "Failed to create session. Please try again.");
		} finally {
			setCreating(false);
		}
	}, [
		selectedProblem,
		selectedPlayers,
		playerCount,
		selectedLanguage,
		timeLimit,
		navigate,
		onClose,
	]);

	const canContinue = useCallback(() => {
		if (step === 1) return !!selectedProblem;
		if (step === 2)
			return timeLimit > 0 && playerCount >= 2 && playerCount <= 4;
		return (
			selectedPlayers.length > 0 && selectedPlayers.length === playerCount - 1
		);
	}, [step, selectedProblem, timeLimit, playerCount, selectedPlayers]);

	return {
		// Data
		problems,
		problemsLoading,
		problemsError,
		users,
		usersLoading,
		searchUsers,

		// State
		step,
		setStep,
		selectedProblem,
		setSelectedProblem,
		selectedLanguage,
		setSelectedLanguage,
		timeLimit,
		setTimeLimit,
		playerCount,
		setPlayerCount,
		selectedPlayers,
		setSelectedPlayers,
		creating,
		error,

		// Actions
		startSession,
		canContinue,
	};
};
