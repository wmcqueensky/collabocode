import { Rocket, Clock, Users } from "lucide-react";

// Components
import ModalHeader from "./components/layout/ModalHeader";
import ModalFooter from "./components/layout/ModalFooter";
import SelectProblemStep from "./components/steps/SelectProblemStep";
import ConfigureSessionStep from "./components/steps/ConfigureSessionStep";
import InvitePlayersStep from "./components/steps/InvitePlayersStep";

// Hooks
import { useCollaborationModal } from "./hooks/useCollaborationModal";

// Constants & Types
import { VIOLET_ICON } from "./constants";
import type { CollaborationModalProps } from "./types";

const CollaborationModal = ({ isOpen, onClose }: CollaborationModalProps) => {
	const {
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
	} = useCollaborationModal({ isOpen, onClose });

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

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-2 sm:p-4"
			onClick={onClose}
		>
			<div
				className="relative bg-[#1f1f1f] rounded-xl shadow-xl w-full max-w-4xl flex flex-col border border-[#3d3654] h-full max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh]"
				onClick={(e) => e.stopPropagation()}
			>
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

				{/* Modal Footer */}
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
