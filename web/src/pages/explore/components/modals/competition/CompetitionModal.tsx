import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Code, Users } from "lucide-react";

// Components
import ModalHeader from "./components/layout/ModalHeader";
import ModalFooter from "./components/layout/ModalFooter";
import SelectLeetCodeProblemStep from "./components/steps/SelectLeetCodeProblemStep";
import ConfigureSessionStep from "./components/steps/ConfigureSessionStep";
import InvitePlayersStep from "./components/steps/InvitePlayersStep";

// Mock data
import { getLeetCodeProblems, getAvailablePlayers } from "./data/mockData";

const CompetitionModal = ({ isOpen, onClose }: any) => {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState("javascript");
	const [timeLimit, setTimeLimit] = useState<number>(30);
	const [playerCount, setPlayerCount] = useState<number>(2);
	const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);

	useEffect(() => {
		const handleEscKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleEscKey);
		return () => window.removeEventListener("keydown", handleEscKey);
	}, [onClose]);

	const startSession = () => {
		navigate("/match");
		onClose();
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

				{/* Modal Content - scrollable area */}
				<div className="flex-1 overflow-y-auto px-3 py-2 sm:px-4">
					{step === 1 ? (
						<SelectLeetCodeProblemStep
							selectedProblem={selectedProblem}
							setSelectedProblem={setSelectedProblem}
							problems={getLeetCodeProblems()}
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
							availablePlayers={getAvailablePlayers()}
							playerCount={playerCount}
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
						startActionText="Start LeetCode Session"
						canContinue={canContinue()}
						canStart={step === 3 && canContinue()}
					/>
				</div>
			</div>
		</div>
	);
};

export default CompetitionModal;
