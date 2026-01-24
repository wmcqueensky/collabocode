import { useState } from "react";
import type { ActivePanel } from "../types";

interface UseMatchUIReturn {
	// Problem panel
	activeProblemTab: string;
	setActiveProblemTab: (tab: string) => void;

	// Chat
	isChatOpen: boolean;
	setIsChatOpen: (open: boolean) => void;

	// Mobile
	isMobileMenuOpen: boolean;
	setIsMobileMenuOpen: (open: boolean) => void;

	// Panel navigation
	activePanel: ActivePanel;
	setActivePanel: (panel: ActivePanel) => void;

	// Mic
	isMicOn: boolean;
	setIsMicOn: (on: boolean) => void;
}

export const useMatchUI = (): UseMatchUIReturn => {
	const [activeProblemTab, setActiveProblemTab] = useState("description");
	const [isChatOpen, setIsChatOpen] = useState(true);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activePanel, setActivePanel] = useState<ActivePanel>("editor");
	const [isMicOn, setIsMicOn] = useState(false);

	return {
		activeProblemTab,
		setActiveProblemTab,
		isChatOpen,
		setIsChatOpen,
		isMobileMenuOpen,
		setIsMobileMenuOpen,
		activePanel,
		setActivePanel,
		isMicOn,
		setIsMicOn,
	};
};
