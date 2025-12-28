import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Clock, Users } from "lucide-react";

// Shared Components from competition modal
import ModalHeader from "../competition/components/layout/ModalHeader";
import ModalFooter from "../competition/components/layout/ModalFooter";
import SelectLeetCodeProblemStep from "../competition/components/steps/SelectLeetCodeProblemStep";
import ConfigureSessionStep from "./components/steps/ConfigureCollaborationSessionStep";
import InvitePlayersStep from "../competition/components/steps/InvitePlayersStep";

// Hooks and Services
import { useCollaborationProblems } from "../../../../../hooks/useCollaborationProblems";
import { useUsers } from "../../../../../hooks/useUsers";
import { sessionService } from "../../../../../services/sessionService";
import type { Problem, Profile } from "../../../../../types/database";

type CollaborationModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

const CollaborationModal = ({ isOpen, onClose }: CollaborationModalProps) => {
	const navigate = useNavigate();

	// Hooks for data - use collaboration-specific problems hook
	const {
		problems,
		loading: problemsLoading,
		error: problemsError,
	} = useCollaborationProblems();
	const { users, loading: usersLoading, searchUsers } = useUsers();

	// State
	const [step, setStep] = useState(1);
	const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState("javascript");
	const [timeLimit, setTimeLimit] = useState<number>(60); // Default longer for collaboration
	const [playerCount, setPlayerCount] = useState<number>(2);
	const [selectedPlayers, setSelectedPlayers] = useState<Profile[]>([]);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Collaboration-specific options
	const [isPublic, setIsPublic] = useState(false);
	const [allowJoinInProgress, setAllowJoinInProgress] = useState(true);
	const [description, setDescription] = useState("");

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
			setTimeLimit(60);
			setPlayerCount(2);
			setSelectedPlayers([]);
			setError(null);
			setIsPublic(false);
			setAllowJoinInProgress(true);
			setDescription("");
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

			console.log("Creating collaboration session with:", {
				type: "collaboration",
				problem: selectedProblem.title,
				language: selectedLanguage,
				timeLimit,
				maxPlayers: playerCount,
				selectedPlayers: selectedPlayers.map((p) => p.username),
				isPublic,
				allowJoinInProgress,
				description,
			});

			// Create the collaboration session
			const session = await sessionService.createSession({
				type: "collaboration",
				problem_id: selectedProblem.id,
				language: selectedLanguage,
				time_limit: timeLimit,
				max_players: playerCount,
				description: description || `Collaboration on ${selectedProblem.title}`,
				is_public: isPublic,
				allow_join_in_progress: allowJoinInProgress,
			});

			console.log("Collaboration session created:", session.id);

			// Invite selected players
			if (selectedPlayers.length > 0) {
				const playerIds = selectedPlayers.map((p) => p.id);
				console.log("Inviting collaborators:", playerIds);
				await sessionService.invitePlayers(session.id, playerIds);
				console.log("Collaborators invited successfully");
			}

			// Navigate to the collaboration page (with waiting lobby)
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
			return <Rocket size={20} className="text-purple-500 mr-2" />;
		if (step === 2) return <Clock size={20} className="text-purple-500 mr-2" />;
		return <Users size={20} className="text-purple-500 mr-2" />;
	};

	const getCurrentStepTitle = () => {
		if (step === 1) return "Select Project";
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
			<div className="relative bg-[#1f1f1f] rounded-xl shadow-xl w-full max-w-4xl flex flex-col border border-gray-700 h-full max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh]">
				{/* Modal Header */}
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
							isPublic={isPublic}
							setIsPublic={setIsPublic}
							allowJoinInProgress={allowJoinInProgress}
							setAllowJoinInProgress={setAllowJoinInProgress}
							description={description}
							setDescription={setDescription}
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

				{/* Modal Footer */}
				<div className="sticky bottom-0 z-10 w-full bg-[#1f1f1f]">
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
