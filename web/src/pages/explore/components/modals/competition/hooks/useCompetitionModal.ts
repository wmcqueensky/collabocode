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

type UseCompetitionModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export const useCompetitionModal = ({
	isOpen,
	onClose,
}: UseCompetitionModalProps) => {
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
			setError(`Please select ${playerCount - 1} player(s)`);
			return;
		}

		try {
			setCreating(true);
			setError(null);

			console.log("Creating session with:", {
				problem: selectedProblem.title,
				language: selectedLanguage,
				timeLimit,
				maxPlayers: playerCount,
				selectedPlayers: selectedPlayers.map((p) => p.username),
			});

			// Create the session (host is automatically added as participant)
			const session = await sessionService.createSession({
				problem_id: selectedProblem.id,
				language: selectedLanguage,
				time_limit: timeLimit,
				max_players: playerCount,
			});

			console.log("Session created:", session.id);

			// Invite selected players (excluding host)
			if (selectedPlayers.length > 0) {
				const playerIds = selectedPlayers.map((p) => p.id);
				console.log("Inviting players:", playerIds);
				await sessionService.invitePlayers(session.id, playerIds);
				console.log("Players invited successfully");
			}

			// Navigate to the match page
			navigate(`/match/${session.id}`);
			onClose();
		} catch (err: any) {
			console.error("Error creating session:", err);
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
