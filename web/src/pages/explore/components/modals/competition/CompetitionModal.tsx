import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Code, Users } from "lucide-react";

// Components
import ModalHeader from "./components/layout/ModalHeader";
import ModalFooter from "./components/layout/ModalFooter";
import SelectLeetCodeProblemStep from "./components/steps/SelectLeetCodeProblemStep";
import ConfigureSessionStep from "./components/steps/ConfigureSessionStep";
import InvitePlayersStep from "./components/steps/InvitePlayersStep";

// Hooks and Services
import { useProblems } from "../../../../../hooks/useProblems";
import { useFriends } from "../../../../../hooks/useFriends";
import { sessionService } from "../../../../../services/sessionService";
import type { Problem, Profile } from "../../../../../types/database";

type CompetitionModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

const CompetitionModal = ({ isOpen, onClose }: CompetitionModalProps) => {
	const navigate = useNavigate();

	// Hooks for data
	const {
		problems,
		loading: problemsLoading,
		error: problemsError,
	} = useProblems();
	const { friends, loading: friendsLoading, searchUsers } = useFriends();

	// State
	const [step, setStep] = useState(1);
	const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState("javascript");
	const [timeLimit, setTimeLimit] = useState<number>(30);
	const [playerCount, setPlayerCount] = useState<number>(2);
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
			setSelectedLanguage("javascript");
			setTimeLimit(30);
			setPlayerCount(2);
			setSelectedPlayers([]);
			setError(null);
		}
	}, [isOpen]);

	const startSession = async () => {
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

			// Create the session
			const session = await sessionService.createSession({
				problem_id: selectedProblem.id,
				language: selectedLanguage,
				time_limit: timeLimit,
				max_players: playerCount,
			});

			// Invite selected players
			const playerIds = selectedPlayers.map((p) => p.id);
			if (playerIds.length > 0) {
				await sessionService.invitePlayers(session.id, playerIds);
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
	};

	if (!isOpen) return null;

	const getCurrentStepIcon = () => {
		if (step === 1) return <Code size={20} className="text-[#5bc6ca] mr-2" />;
		if (step === 2) return <Clock size={20} className="text-[#5bc6ca] mr-2" />;
		return <Users size={20} className="text-[#5bc6ca] mr-2" />;
	};

	const getCurrentStepTitle = () => {
		if (step === 1) return "Select LeetCode Problem";
		if (step === 2) return "Configure Session";
		return "Invite Players";
	};

	const canContinue = () => {
		if (step === 1) return !!selectedProblem;
		if (step === 2)
			return timeLimit > 0 && playerCount >= 2 && playerCount <= 4;
		return (
			selectedPlayers.length > 0 && selectedPlayers.length === playerCount - 1
		);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-2 sm:p-4">
			<div className="relative bg-[#1f1f1f] rounded-xl shadow-xl w-full max-w-4xl flex flex-col border border-gray-700 h-full max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh]">
				{/* Modal Header - fixed at top */}
				<ModalHeader
					icon={getCurrentStepIcon()}
					title={getCurrentStepTitle()}
					onClose={onClose}
				/>

				{/* Error Display */}
				{(error || problemsError) && (
					<div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
						{error || problemsError}
					</div>
				)}

				{/* Modal Content - scrollable area */}
				<div className="flex-1 overflow-y-auto px-3 py-2 sm:px-4">
					{step === 1 ? (
						<SelectLeetCodeProblemStep
							selectedProblem={selectedProblem}
							setSelectedProblem={setSelectedProblem}
							problems={problems}
							loading={problemsLoading}
						/>
					) : step === 2 ? (
						<ConfigureSessionStep
							selectedProblem={selectedProblem}
							selectedLanguage={selectedLanguage}
							setSelectedLanguage={setSelectedLanguage}
							timeLimit={timeLimit}
							setTimeLimit={setTimeLimit}
							playerCount={playerCount}
							setPlayerCount={setPlayerCount}
						/>
					) : (
						<InvitePlayersStep
							selectedProblem={selectedProblem}
							selectedLanguage={selectedLanguage}
							selectedPlayers={selectedPlayers}
							setSelectedPlayers={setSelectedPlayers}
							availablePlayers={friends}
							playerCount={playerCount}
							timeLimit={timeLimit}
							loading={friendsLoading}
							searchUsers={searchUsers}
						/>
					)}
				</div>

				{/* Modal Footer - fixed at bottom */}
				<div className="sticky bottom-0 z-10 w-full bg-[#1f1f1f]">
					<ModalFooter
						step={step}
						totalSteps={3}
						setStep={setStep}
						onClose={onClose}
						startAction={startSession}
						startActionText={
							creating ? "Creating..." : "Start LeetCode Session"
						}
						canContinue={canContinue()}
						canStart={step === 3 && canContinue() && !creating}
					/>
				</div>
			</div>
		</div>
	);
};

export default CompetitionModal;
