import type { Problem, Profile } from "../../../../../types/database";

export type CompetitionModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export type CompetitionModalState = {
	step: number;
	selectedProblem: Problem | null;
	selectedLanguage: string;
	timeLimit: number;
	playerCount: number;
	selectedPlayers: Profile[];
	creating: boolean;
	error: string | null;
};

export type SelectLeetCodeProblemStepProps = {
	selectedProblem: Problem | null;
	setSelectedProblem: (p: Problem | null) => void;
	problems: Problem[];
	loading?: boolean;
};

export type ConfigureSessionStepProps = {
	selectedProblem: Problem | null;
	selectedLanguage: string;
	setSelectedLanguage: (lang: string) => void;
	timeLimit: number;
	setTimeLimit: (n: number) => void;
	playerCount: number;
	setPlayerCount: (n: number) => void;
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
	searchUsers: (query: string) => Promise<Profile[]>;
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
	id: string;
	name: string;
};
