import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Clock, Users } from "lucide-react";

// Collaboration-specific components (violet theme)
import ModalHeader from "./components/layout/ModalHeader";
import ModalFooter from "./components/layout/ModalFooter";
import SelectProblemStep from "./components/steps/SelectProblemStep";
import ConfigureSessionStep from "./components/steps/ConfigureSessionStep";
import InvitePlayersStep from "./components/steps/InvitePlayersStep";

// Hooks and Services
import { useProblems } from "../../../../../hooks/useProblems";
import { useUsers } from "../../../../../hooks/useUsers";
import { sessionService } from "../../../../../services/sessionService";
import type { Problem, Profile } from "../../../../../types/database";

// Violet accent for icons
const VIOLET_ICON = "text-[#a78bfa]";

type CollaborationModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

const CollaborationModal = ({ isOpen, onClose }: CollaborationModalProps) => {
	const navigate = useNavigate();

	// Hooks
	const {
		problems,
		loading: problemsLoading,
		error: problemsError,
	} = useProblems();
	const { users, loading: usersLoading, searchUsers } = useUsers();

	// State
	const [step, setStep] = useState(1);
	const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState("javascript");
	const [timeLimit, setTimeLimit] = useState<number>(45);
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
			setTimeLimit(45);
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
	};

	if (!isOpen) return null;

	const getCurrentStepIcon = () => {
		if (step === 1)
			return <Rocket size={20} className={`${VIOLET_ICON} mr-2`} />;
		if (step === 2)
			return <Clock size={20} className={`${VIOLET_ICON} mr-2`} />;
		return <Users size={20} className={`${VIOLET_ICON} mr-2`} />;
	};

	const getCurrentStepTitle = () => {
		if (step === 1) return "Select Problem";
		if (step === 2) return "Configure Session";
		return "Invite Collaborators";
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
			<div className="relative bg-[#1f1f1f] rounded-xl shadow-xl w-full max-w-4xl flex flex-col border border-[#3d3654] h-full max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh]">
				{/* Modal Header - Violet themed */}
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

				{/* Modal Content */}
				<div className="flex-1 overflow-y-auto">
					{step === 1 ? (
						<SelectProblemStep
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
							availablePlayers={users}
							playerCount={playerCount}
							timeLimit={timeLimit}
							loading={usersLoading}
							searchUsers={searchUsers}
						/>
					)}
				</div>

				{/* Modal Footer - Violet themed */}
				<div className="sticky bottom-0 z-10 w-full bg-[#1f1f1f] rounded-b-xl">
					<ModalFooter
						step={step}
						totalSteps={3}
						setStep={setStep}
						onClose={onClose}
						startAction={startSession}
						startActionText={creating ? "Creating..." : "Start Collaboration"}
						canContinue={canContinue()}
						canStart={step === 3 && canContinue() && !creating}
					/>
				</div>
			</div>
		</div>
	);
};

export default CollaborationModal;
