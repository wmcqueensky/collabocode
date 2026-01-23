import type { Problem, Profile } from "../../../../../types/database";

export type CollaborationModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export type CollaborationModalState = {
	step: number;
	selectedProblem: Problem | null;
	selectedLanguage: string;
	timeLimit: number;
	playerCount: number;
	selectedPlayers: Profile[];
	creating: boolean;
	error: string | null;
};

export type SelectProblemStepProps = {
	selectedProblem: Problem | null;
	setSelectedProblem: (problem: Problem | null) => void;
	problems: Problem[];
	loading?: boolean;
};

export type ConfigureSessionStepProps = {
	selectedProblem: Problem | null;
	selectedLanguage: string;
	setSelectedLanguage: (language: string) => void;
	timeLimit: number;
	setTimeLimit: (limit: number) => void;
	playerCount: number;
	setPlayerCount: (count: number) => void;
};

export type InvitePlayersStepProps = {
	selectedProblem: Problem | null;
	selectedLanguage: string;
	selectedPlayers: Profile[];
	setSelectedPlayers: (players: Profile[]) => void;
	availablePlayers: Profile[];
	playerCount: number;
	timeLimit: number;
	loading?: boolean;
	searchUsers?: (query: string) => Promise<Profile[]>;
};

export type ModalHeaderProps = {
	icon?: React.ReactNode;
	title?: React.ReactNode;
	onClose?: () => void;
};

export type ModalFooterProps = {
	step: number;
	totalSteps?: number;
	setStep: (n: number) => void;
	onClose: () => void;
	startAction?: () => void;
	startActionText?: string;
	canContinue?: boolean;
	canStart?: boolean;
};

export type ProgrammingLanguage = {
	value: string;
	label: string;
};

export type TimeOption = {
	value: number;
	label: string;
};
