import { useState, useEffect } from "react";
import { MOBILE_BREAKPOINT } from "../constants";

interface UseCollaborationUIReturn {
	isChatOpen: boolean;
	isMicOn: boolean;
	activeProblemTab: string;
	mobileView: "code" | "problem" | "chat";
	isMobile: boolean;
	toggleChat: () => void;
	toggleMic: () => void;
	setActiveProblemTab: (tab: string) => void;
	setMobileView: (view: "code" | "problem" | "chat") => void;
}

export function useCollaborationUI(): UseCollaborationUIReturn {
	const [isChatOpen, setIsChatOpen] = useState(true);
	const [isMicOn, setIsMicOn] = useState(false);
	const [activeProblemTab, setActiveProblemTab] = useState("description");
	const [mobileView, setMobileView] = useState<"code" | "problem" | "chat">(
		"code",
	);
	const [isMobile, setIsMobile] = useState(false);

	// Check screen size
	useEffect(() => {
		const checkScreenSize = () => {
			const mobile = window.innerWidth < MOBILE_BREAKPOINT;
			setIsMobile(mobile);
			if (mobile) {
				setIsChatOpen(false);
			} else {
				setIsChatOpen(true);
			}
		};

		checkScreenSize();
		window.addEventListener("resize", checkScreenSize);
		return () => window.removeEventListener("resize", checkScreenSize);
	}, []);

	const toggleChat = () => {
		setIsChatOpen(!isChatOpen);
	};

	const toggleMic = () => {
		setIsMicOn(!isMicOn);
	};

	return {
		isChatOpen,
		isMicOn,
		activeProblemTab,
		mobileView,
		isMobile,
		toggleChat,
		toggleMic,
		setActiveProblemTab,
		setMobileView,
	};
}
